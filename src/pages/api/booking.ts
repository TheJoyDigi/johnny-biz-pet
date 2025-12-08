import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define response type
type ResponseData = {
  success: boolean;
  message: string;
};

// Configure email settings
const EMAIL_CONFIG = {
  recipientEmail:
    process.env.BOOKING_RECIPIENT_EMAIL || "hello@ruhrohretreat.com", // Use environment variable with fallback
  subject: "New Booking Request",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const {
      sitterId,
      sitterName,
      locationName,
      serviceId,
      firstName,
      lastName,
      email,
      phone,
      petName,
      petType,
      startDate,
      startTime,
      endDate,
      endTime,
      addons,
      notes,
      referralSource,
    } = req.body;

    // Basic validation
    if (
      !sitterName ||
      !serviceId ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !petName ||
      !startDate ||
      !endDate
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Validate pet type
    if (petType !== "dog" && petType !== "cat" && petType !== "other") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid pet type" });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res
        .status(400)
        .json({ success: false, message: "End date must be after start date" });
    }

    // Calculate nights
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // --- Database Operations ---

    // 1. Get Sitter details
    const { data: sitterData, error: sitterError } = await supabase
      .from("sitters")
      .select(`
        id, 
        sitter_primary_services (
            id,
            price_cents,
            service_types ( id, slug, name )
        )
      `)
      .eq("id", sitterId)
      .single();

    if (sitterError || !sitterData) {
      console.error("Error finding sitter:", sitterError?.message);
      throw new Error("Sitter not found in database");
    }
    const sitterUuid = sitterData.id;

    // Find service price
    let _baseRateCents = 0;
    let _serviceTypeId = null;
    let _sitterServiceId = null;
    let _serviceName = serviceId; // Default to input ID/Name

    if (sitterData.sitter_primary_services && Array.isArray(sitterData.sitter_primary_services)) {
        let found = sitterData.sitter_primary_services.find((s: any) => s.id === serviceId);

        if (!found) {
            found = sitterData.sitter_primary_services.find((s: any) => {
                // @ts-ignore
                const st = Array.isArray(s.service_types) ? s.service_types[0] : s.service_types;
                return st?.slug === serviceId || st?.name === serviceId;
            });
        }

        if (!found) {
             found = sitterData.sitter_primary_services.find((s: any) => {
                // @ts-ignore
                const st = Array.isArray(s.service_types) ? s.service_types[0] : s.service_types;
                return st?.slug === 'dog-boarding';
             });
        }

        if (found) {
            _baseRateCents = found.price_cents;
            _sitterServiceId = found.id;
            // @ts-ignore
            const st = Array.isArray(found.service_types) ? found.service_types[0] : found.service_types;
            _serviceTypeId = st?.id;
            _serviceName = st?.name || serviceId;
        }
    }

    // 2. Upsert Customer
    const { data: customerData } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .single();
    
    let customerId;
    if (customerData) {
        customerId = customerData.id;
        await supabase.from("customers").update({ name: `${firstName} ${lastName}` }).eq("id", customerId);
    } else {
        const { data: newCustomer, error: createCustomerError } = await supabase
            .from("customers")
            .insert({ email, name: `${firstName} ${lastName}` })
            .select("id")
            .single();
        if (createCustomerError) throw createCustomerError;
        customerId = newCustomer.id;
    }

    // 3. Upsert Pet
    const { data: petData } = await supabase
        .from("pets")
        .select("id")
        .eq("customer_id", customerId)
        .eq("name", petName)
        .single();
    
    let petId;
    if (petData) {
        petId = petData.id;
        await supabase.from("pets").update({ breed: petType }).eq("id", petId);
    } else {
        const { data: newPet, error: createPetError } = await supabase
            .from("pets")
            .insert({ customer_id: customerId, name: petName, breed: petType })
            .select("id")
            .single();
        if (createPetError) throw createPetError;
        petId = newPet.id;
    }

    // 4. Create Booking Request
    const { data: bookingRequest, error: bookingError } = await supabase
      .from("booking_requests")
      .insert({
        customer_id: customerId,
        assigned_sitter_id: sitterUuid,
        start_date: startDate,
        end_date: endDate,
        status: "PENDING_SITTER_ACCEPTANCE",
        service_type_id: _serviceTypeId,
        sitter_service_id: _sitterServiceId,
        base_rate_at_booking_cents: _baseRateCents,
      })
      .select("id")
      .single();

    if (bookingError) throw bookingError;
    const bookingId = bookingRequest.id;

    // 5. Link Pet
    await supabase.from("booking_pets").insert({
        booking_request_id: bookingId,
        pet_id: petId
    });

    // 6. Add Booking Note
    if (notes) {
        await supabase.from("booking_notes").insert({
            booking_request_id: bookingId,
            note: notes
        });
    }

    // 7. Add Booking Addons & Prepare Email Data
    const formattedAddons: string[] = [];
    if (addons && Object.keys(addons).length > 0) {
        const addonKeys = Object.keys(addons).filter(k => addons[k] > 0);
        
        if (addonKeys.length > 0) {
            const { data: sitterAddons } = await supabase
                .from("sitter_addons")
                .select("id, name, price_cents")
                .eq("sitter_id", sitterUuid)
                .or(`id.in.(${addonKeys.map(k => `"${k}"`).join(',')}),name.in.(${addonKeys.map(k => `"${k}"`).join(',')})`); 
            
            if (sitterAddons) {
                const bookingAddonsToInsert = [];
                for (const sa of sitterAddons) {
                    let qty = addons[sa.id] || addons[sa.name];
                    if (qty > 0) {
                         bookingAddonsToInsert.push({
                            booking_request_id: bookingId,
                            sitter_addon_id: sa.id,
                            price_cents_at_booking: sa.price_cents,
                            quantity: qty
                        });
                        formattedAddons.push(`${sa.name} (x${qty})`);
                    }
                }
                if (bookingAddonsToInsert.length) {
                    await supabase.from("booking_addons").insert(bookingAddonsToInsert);
                }
            }
        }
    }

    // 8. Create Recipient
    await supabase.from("booking_sitter_recipients").insert({
        booking_request_id: bookingId,
        sitter_id: sitterUuid,
        status: "NOTIFIED"
    });

    // 9. Calculate Cost
    if (bookingId && sitterUuid) {
       const { data: costBreakdown, error: calcError } = await supabase.rpc('calculate_booking_cost', {
            booking_id: bookingId,
            sitter_profile_id: sitterUuid
       });

       if (!calcError && costBreakdown) {
           await supabase.from("booking_requests").update({
                total_cost_cents: costBreakdown.total_cost_cents,
                base_rate_at_booking_cents: costBreakdown.base_rate_at_booking_cents,
                addons_total_cost_cents: costBreakdown.addons_total_cost_cents,
                discount_applied_cents: costBreakdown.discount_applied_cents,
                platform_fee_cents: costBreakdown.platform_fee_cents,
                sitter_payout_cents: costBreakdown.sitter_payout_cents
           }).eq('id', bookingId);
       } else {
           console.error("Failed to calculate initial booking cost:", calcError);
       }
    }

    // --- Format for Email ---
    const formattedStartDate = new Date(startDate).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
    const formattedEndDate = new Date(endDate).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    const bookingDetailsHtml = `
      <p><strong>Sitter:</strong> ${sitterName}</p>
      <p><strong>Location:</strong> ${locationName}</p>
      <p><strong>Service:</strong> ${_serviceName}</p>
      <p><strong>Customer:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Pet Name:</strong> ${petName}</p>
      <p><strong>Pet Type:</strong> ${petType.charAt(0).toUpperCase() + petType.slice(1)}</p>
      <p><strong>Drop Off:</strong> ${formattedStartDate} at ${startTime}</p>
      <p><strong>Pick Up:</strong> ${formattedEndDate} at ${endTime}</p>
      <p><strong>Number of Nights:</strong> ${nights}</p>
      ${formattedAddons.length > 0 ? `<h3>Additional Services:</h3><ul>${formattedAddons.map(a => `<li>${a}</li>`).join("")}</ul>` : ""}
      ${notes ? `<h3>Additional Notes:</h3><p>${notes}</p>` : ""}
      ${referralSource ? `<p><strong>Referral Source:</strong> ${referralSource}</p>` : ""}
    `;

    const businessEmailContent = `<h2>New Booking Request</h2>${bookingDetailsHtml}`;
    const customerEmailContent = `
      <h2>Booking Request Confirmation</h2>
      <p>Dear ${firstName},</p>
      <p>Thank you for your booking request for ${petName} with ${sitterName}. We have received your request and will get back to you within 24 hours to confirm your booking.</p>
      <h3>Booking Summary:</h3>
      ${bookingDetailsHtml}
      <p>We look forward to meeting you and ${petName}!</p>
      <p>Best,</p>
      <p>Ruh-Roh Retreat Team</p>
    `;

    // Email Sending Logic
    const skipEmail = process.env.SKIP_BOOKING_EMAIL === 'true';
    if (!skipEmail) {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
          port: parseInt(process.env.EMAIL_PORT || "587"),
          secure: process.env.EMAIL_SECURE === "true",
          auth: {
            user: process.env.EMAIL_USER || "88f0c6001@smtp-brevo.com",
            pass: process.env.EMAIL_PASS || "wkzmLHvPc2IGSK5f",
          },
        });

        await transporter.sendMail({
          from: `"Ruh-Roh Retreat Website" <${process.env.EMAIL_FROM || "hello@ruhrohretreat.com"}>`,
          to: EMAIL_CONFIG.recipientEmail,
          subject: `${EMAIL_CONFIG.subject} - ${sitterName}`,
          html: businessEmailContent,
          replyTo: email,
        });

        await transporter.sendMail({
          from: `"Ruh-Roh Retreat" <${process.env.EMAIL_FROM || "hello@ruhrohretreat.com"}>`,
          to: email,
          subject: "Booking Request Confirmation",
          html: customerEmailContent,
        });
    } else {
        console.log("Skipping booking email due to SKIP_BOOKING_EMAIL environment variable.");
    }

    return res.status(200).json({ success: true, message: "Booking request sent successfully" });

  } catch (error) {
    console.error("Error processing booking request:", error);
    return res.status(500).json({ success: false, message: "An error occurred while processing your request" });
  }
}
