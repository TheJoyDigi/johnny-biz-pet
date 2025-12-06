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
      sitterId, // This is likely the slug (e.g., "johnny-irvine") from the frontend
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

    // Validate pet type (must be dog or cat)
    if (petType !== "dog" && petType !== "cat" && petType !== "other") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid pet type" });
    }

    // Validate that end date is after start date
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res
        .status(400)
        .json({ success: false, message: "End date must be after start date" });
    }

    // Calculate number of nights
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // --- Database Operations ---

    // 1. Get Sitter UUID from slug (sitterId from frontend)
    const { data: sitterData, error: sitterError } = await supabase
      .from("sitters")
      .select(`
        id, 
        sitter_primary_services (
            price_cents,
            service_types ( slug, name )
        )
      `)
      .eq("slug", sitterId)
      .single();

    if (sitterError || !sitterData) {
      console.error("Error finding sitter:", sitterError?.message);
      throw new Error("Sitter not found in database");
    }
    const sitterUuid = sitterData.id;

    // Find the matching service price
    // serviceId from body could be name or slug. Try to match both.
    let _baseRateCents = 0;
    if (sitterData.sitter_primary_services && Array.isArray(sitterData.sitter_primary_services)) {
        const found = sitterData.sitter_primary_services.find((s: any) => 
            s.service_types.slug === serviceId || s.service_types.name === serviceId
        );
        // If not found, default to first service or remain 0 (maybe 'Dog Boarding' default?)
        if (found) {
            _baseRateCents = found.price_cents;
        } else {
             // Fallback to Dog Boarding if specific service not matched
             const defaultService = sitterData.sitter_primary_services.find((s: any) => s.service_types.slug === 'dog-boarding');
             if (defaultService) _baseRateCents = defaultService.price_cents;
        }
    }

    // 2. Upsert Customer
    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .single();
    
    let customerId;
    if (customerData) {
        customerId = customerData.id;
        // Optionally update name/phone
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
    // Check if pet exists for this customer
    const { data: petData } = await supabase
        .from("pets")
        .select("id")
        .eq("customer_id", customerId)
        .eq("name", petName)
        .single();
    
    let petId;
    if (petData) {
        petId = petData.id;
        // update details
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
        county: locationName, // Approximate mapping
        status: "PENDING_SITTER_ACCEPTANCE",
        base_rate_at_booking_cents: _baseRateCents,
        // total_cost_cents: ... calculation logic could go here or DB function
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
            // user_id is null for guest booking notes or could be linked if we had auth user
        });
    }

    // 7. Add Booking Addons
    // addons is { "Addon Name": quantity }
    // Need to lookup addon IDs from sitter_addons table
    if (addons && Object.keys(addons).length > 0) {
        const addonNames = Object.keys(addons).filter(k => addons[k] > 0);
        if (addonNames.length > 0) {
            const { data: sitterAddons } = await supabase
                .from("sitter_addons")
                .select("id, name, price_cents")
                .eq("sitter_id", sitterUuid)
                .in("name", addonNames);
            
            if (sitterAddons) {
                const bookingAddonsToInsert = [];
                for (const sa of sitterAddons) {
                    const qty = addons[sa.name];
                    // Support multiple quantities? Schema booking_addons is (booking_request_id, sitter_addon_id) PK.
                    // So it supports only 1 entry per addon type per booking. 
                    // If quantity > 1, schema might need update or we just store it once.
                    // For now, assuming 1 per type or just presence.
                    // Wait, Phase 2 requirements might specify quantity.
                    // Schema check: booking_addons has no quantity column.
                    // For MVP Phase 2, we'll just link it.
                    bookingAddonsToInsert.push({
                        booking_request_id: bookingId,
                        sitter_addon_id: sa.id,
                        price_cents_at_booking: sa.price_cents
                    });
                }
                if (bookingAddonsToInsert.length) {
                    await supabase.from("booking_addons").insert(bookingAddonsToInsert);
                }
            }
        }
    }

    // 8. Create Sitter Recipient
    await supabase.from("booking_sitter_recipients").insert({
        booking_request_id: bookingId,
        sitter_id: sitterUuid,
        status: "NOTIFIED"
    });

    // --- End Database Operations ---

    // Format addons for email
    const selectedAddons = Object.entries(addons)
      .filter(([_, quantity]) => Number(quantity) > 0)
      .map(([name, quantity]) => `${name} (x${quantity})`);

    // Format dates for email
    const formattedStartDate = new Date(startDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedEndDate = new Date(endDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Common booking details for both emails
    const bookingDetailsHtml = `
      <p><strong>Sitter:</strong> ${sitterName}</p>
      <p><strong>Location:</strong> ${locationName}</p>
      <p><strong>Service:</strong> ${serviceId}</p>
      <p><strong>Customer:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Pet Name:</strong> ${petName}</p>
      <p><strong>Pet Type:</strong> ${
        petType.charAt(0).toUpperCase() + petType.slice(1)
      }</p>
      <p><strong>Drop Off:</strong> ${formattedStartDate} at ${startTime}</p>
      <p><strong>Pick Up:</strong> ${formattedEndDate} at ${endTime}</p>
      <p><strong>Number of Nights:</strong> ${nights}</p>
      
      ${
        selectedAddons.length > 0
          ? `
        <h3>Additional Services:</h3>
        <ul>
          ${selectedAddons.map((addon) => `<li>${addon}</li>`).join("")}
        </ul>
      `
          : ""
      }
      
      ${
        notes
          ? `
        <h3>Additional Notes:</h3>
        <p>${notes}</p>
      `
          : ""
      }

      ${
        referralSource
          ? `
        <p><strong>Referral Source:</strong> ${referralSource}</p>
      `
          : ""
      }
    `;

    // Create email content for the business
    const businessEmailContent = `
      <h2>New Booking Request</h2>
      ${bookingDetailsHtml}
    `;

    // Create email content for the customer
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

    // Setup nodemailer transporter
    // IMPORTANT: EMAIL_SECURE must be set to 'false' in production
    // Setting it to 'true' will cause email sending to fail with most SMTP providers
    // when using port 587 with STARTTLS
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "88f0c6001@smtp-brevo.com",
        pass: process.env.EMAIL_PASS || "wkzmLHvPc2IGSK5f",
      },
    });

    // Send email to business
    await transporter.sendMail({
      from: `"Ruh-Roh Retreat Website" <${
        process.env.EMAIL_FROM || "hello@ruhrohretreat.com"
      }>`,
      to: EMAIL_CONFIG.recipientEmail,
      subject: `${EMAIL_CONFIG.subject} - ${sitterName}`,
      html: businessEmailContent,
      replyTo: email,
    });

    // Send confirmation email to customer
    await transporter.sendMail({
      from: `"Ruh-Roh Retreat" <${
        process.env.EMAIL_FROM || "hello@ruhrohretreat.com"
      }>`,
      to: email,
      subject: "Booking Request Confirmation",
      html: customerEmailContent,
    });

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Booking request sent successfully" });
  } catch (error) {
    console.error("Error processing booking request:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
}
