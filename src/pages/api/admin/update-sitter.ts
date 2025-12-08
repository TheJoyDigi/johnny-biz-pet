import { createClient } from '@supabase/supabase-js';
import { type NextApiRequest, type NextApiResponse } from 'next';
import { isAdmin } from '@/utils/api/is-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdminUser = await isAdmin(req, res);
  if (!isAdminUser) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { 
    userId, sitterId,
    firstName, lastName, phone, email,
    slug, tagline, address, lat, lng, isActive,
    bio, skills, homeEnvironment, careStyle, parentExpectations,
    addons, discounts, services, locationDetails
  } = req.body;

  if (!userId && !sitterId) {
    return res.status(400).json({ message: 'User ID or Sitter ID is required.' });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let targetSitterId = sitterId;

    if (userId) {
        // 1. Update the users table
        const { error: userError } = await supabaseAdmin
          .from('users')
          .update({ 
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
          })
          .eq('id', userId);

        if (userError) throw new Error(`User update error: ${userError.message}`);

        if (!targetSitterId) {
            // Get Sitter ID if not provided
            const { data: sitter, error: getSitterError } = await supabaseAdmin
                .from('sitters')
                .select('id')
                .eq('user_id', userId)
                .single();
            
            if (getSitterError) throw new Error(`Sitter not found: ${getSitterError.message}`);
            targetSitterId = sitter.id;
        }
    }

    if (!targetSitterId) throw new Error("Could not resolve Sitter ID");

    const sitterUpdate: any = { 
        slug,
        tagline,
        address,
        lat, 
        lng,
        is_active: isActive,
        bio: bio.map((b: any) => b.text),
        skills: skills.map((s: any) => s.text),
        home_environment: homeEnvironment.map((h: any) => h.text),
        care_style: careStyle.map((c: any) => c.text),
        parent_expectations: parentExpectations.map((p: any) => p.text),
        location_details: locationDetails // Add this
    };

    // If no user linked, update profile fields on sitter table
    if (!userId) {
        sitterUpdate.first_name = firstName;
        sitterUpdate.last_name = lastName;
        sitterUpdate.contact_email = email;
    }

    const { error: sitterError } = await supabaseAdmin
      .from('sitters')
      .update(sitterUpdate)
      .eq('id', targetSitterId);

    if (sitterError) throw new Error(`Sitter update error: ${sitterError.message}`);

    // Update Primary Services
    if (services && Array.isArray(services)) {
        const servicesToUpsert = services
            .filter((s: any) => s.enabled)
            .map((s: any) => ({
                sitter_id: targetSitterId,
                service_type_id: s.serviceTypeId,
                price_cents: Math.round(s.price * 100)
            }));
            
        const servicesToDelete = services
            .filter((s: any) => !s.enabled)
            .map((s: any) => s.serviceTypeId);

        if (servicesToUpsert.length > 0) {
            const { error: upsertError } = await supabaseAdmin
                .from('sitter_primary_services')
                .upsert(servicesToUpsert, { onConflict: 'sitter_id, service_type_id' });
            if (upsertError) throw new Error(`Services upsert error: ${upsertError.message}`);
        }

        if (servicesToDelete.length > 0) {
             const { error: deleteError } = await supabaseAdmin
                .from('sitter_primary_services')
                .delete()
                .eq('sitter_id', targetSitterId)
                .in('service_type_id', servicesToDelete);
             if (deleteError) throw new Error(`Services delete error: ${deleteError.message}`);
        }
    }

    // 3. Manage Addons
    const { data: existingAddons } = await supabaseAdmin.from('sitter_addons').select('id').eq('sitter_id', targetSitterId);
    const existingAddonIds = existingAddons?.map(a => a.id) || [];
    const payloadAddonIds = addons.filter((a: any) => a.id).map((a: any) => a.id);
    
    const addonsToDelete = existingAddonIds.filter(id => !payloadAddonIds.includes(id));
    if (addonsToDelete.length > 0) {
        await supabaseAdmin.from('sitter_addons').delete().in('id', addonsToDelete);
    }

    const addonsToUpsert = addons.map((a: any) => {
        const item: any = {
            sitter_id: targetSitterId,
            name: a.name,
            price_cents: Math.round(a.price * 100),
            description: a.description
        };
        if (a.id) item.id = a.id;
        return item;
    });
    if (addonsToUpsert.length > 0) {
        const { error: addonError } = await supabaseAdmin.from('sitter_addons').upsert(addonsToUpsert);
        if (addonError) throw new Error(`Addons update error: ${addonError.message}`);
    }

    // 4. Manage Discounts
    const { data: existingDiscounts } = await supabaseAdmin.from('sitter_discounts').select('id').eq('sitter_id', targetSitterId);
    const existingDiscountIds = existingDiscounts?.map(d => d.id) || [];
    const payloadDiscountIds = discounts.filter((d: any) => d.id).map((d: any) => d.id);

    const discountsToDelete = existingDiscountIds.filter(id => !payloadDiscountIds.includes(id));
    if (discountsToDelete.length > 0) {
        await supabaseAdmin.from('sitter_discounts').delete().in('id', discountsToDelete);
    }

    const discountsToUpsert = discounts.map((d: any) => ({
        id: d.id,
        sitter_id: targetSitterId,
        min_days: d.minDays,
        percentage: d.percentage
    }));
    if (discountsToUpsert.length > 0) {
        const { error: discountError } = await supabaseAdmin.from('sitter_discounts').upsert(discountsToUpsert);
        if (discountError) throw new Error(`Discounts update error: ${discountError.message}`);
    }

    res.status(200).json({ message: 'Sitter updated successfully.' });

  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
}
