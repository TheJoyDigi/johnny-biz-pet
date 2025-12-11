require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testCostLogicWithAddons() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('--- STARTING ADD-ON TEST ---');

  // 1. Find a sitter with add-ons
  const { data: addons, error: addonError } = await supabase
    .from('sitter_addons')
    .select('id, price_cents, name, sitter_id')
    .limit(1);

  if (addonError || !addons.length) {
    console.error('Error fetching addons:', addonError);
    return;
  }

  const addon = addons[0];
  console.log(`Found Addon: ${addon.name} ($${addon.price_cents / 100}) for Sitter: ${addon.sitter_id}`);

  // 2. Get Sitter & Primary Service details
  const { data: sitterData, error: sitterError } = await supabase
    .from('sitters')
    .select('id, user_id, sitter_primary_services(id, price_cents)')
    .eq('id', addon.sitter_id)
    .single();

  if (sitterError) {
      console.error('Error fetching sitter details:', sitterError);
      return;
  }
  
  const primaryService = sitterData.sitter_primary_services?.[0];
  if (!primaryService) {
      console.error('Sitter has no primary services');
      return;
  }

  // 3. Create Customer
  const { data: customer } = await supabase
    .from('customers')
    .insert({
        name: 'Addon Test Customer',
        email: `test_addon_${Date.now()}@example.com`
    })
    .select()
    .single();

  // 4. Create Booking
  const startDate = '2025-07-01';
  const endDate = '2025-07-04'; // 3 nights
  const days = 3; 

  const { data: booking } = await supabase
    .from('booking_requests')
    .insert({
        customer_id: customer.id,
        start_date: startDate,
        end_date: endDate,
        sitter_service_id: primaryService.id,
        status: 'PENDING_SITTER_ACCEPTANCE'
    })
    .select()
    .single();
    
  console.log(`Created Booking: ${booking.id}`);

  // 5. Add Add-on to Booking
  const addonQty = 2;
  const { error: bookingAddonError } = await supabase
    .from('booking_addons')
    .insert({
        booking_request_id: booking.id,
        sitter_addon_id: addon.id,
        quantity: addonQty
    });

  if (bookingAddonError) {
      console.error('Error adding addon to booking:', bookingAddonError);
      return;
  }
  console.log(`Added ${addonQty} x ${addon.name} to booking.`);

  // 6. Test Calculation
  console.log('🧮 Calculating Cost...');
  const { data: costData, error: calcError } = await supabase
    .rpc('calculate_booking_cost', {
        booking_id: booking.id,
        sitter_profile_id: sitterData.id, 
        p_service_primary_id: primaryService.id
    });

  if (calcError) {
      console.error('Calc Error:', calcError);
      return;
  }

  console.log('Result:', JSON.stringify(costData, null, 2));

  // Assertions
  const baseRate = primaryService.price_cents;
  const addonRate = addon.price_cents;
  
  const totalBase = baseRate * days;
  const totalAddons = addonRate * addonQty;
  const subtotal = totalBase + totalAddons;
  
  const ownerFee = Math.round(subtotal * 0.07);
  const totalCost = subtotal + ownerFee;
  
  const platformFeeSitterPrimary = Math.round(totalBase * 0.15);
  const platformFeeSitterAddon = Math.round(totalAddons * 0.00); // Should be 0
  const totalPlatformFee = ownerFee + platformFeeSitterPrimary + platformFeeSitterAddon;
  const sitterPayout = subtotal - (platformFeeSitterPrimary + platformFeeSitterAddon);

  console.log('--- EXPECTED ---');
  console.log(`Base (${days} @ ${baseRate}): ${totalBase}`);
  console.log(`Addons (${addonQty} @ ${addonRate}): ${totalAddons}`);
  console.log(`Subtotal: ${subtotal}`);
  console.log(`Owner Fee (7%): ${ownerFee}`);
  console.log(`Total Cost: ${totalCost}`);
  console.log(`Platform Fee (${ownerFee} + ${platformFeeSitterPrimary} + ${platformFeeSitterAddon}): ${totalPlatformFee}`);
  console.log(`Sitter Payout: ${sitterPayout}`);

  // 7. Accept
  console.log('🤝 Accepting...');
  await supabase.rpc('accept_booking_request', {
      booking_id: booking.id,
      sitter_user_id: sitterData.user_id
  });
  
  const { data: finalBooking } = await supabase
    .from('booking_requests')
    .select('total_cost_cents, sitter_payout_cents, platform_fee_cents, owner_service_fee_cents, addons_total_cost_cents')
    .eq('id', booking.id)
    .single();
    
    console.log('Final DB Record:', finalBooking);

    // Teardown
    if (booking && booking.id) {
      console.log('🧹 Cleaning up test booking:', booking.id);
      await supabase.from('booking_requests').delete().eq('id', booking.id);
    }
}

testCostLogicWithAddons();
