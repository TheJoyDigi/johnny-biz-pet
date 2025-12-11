require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testCostLogic() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🗑️  Deleting all existing bookings...');
  const { error: deleteError } = await supabase
    .from('booking_requests')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all
  
  if (deleteError) {
    console.error('Error deleting bookings:', deleteError);
    return;
  }

  console.log('🔍 Fetching a sitter and service...');
  const { data: sitters, error: sitterError } = await supabase
    .from('sitters')
    .select('id, user_id, sitter_primary_services(id, price_cents, service_types(slug))')
    .limit(1);

  if (sitterError || !sitters.length) {
    console.error('Error fetching sitter:', sitterError);
    return;
  }

  const sitter = sitters[0];
  const primaryService = sitter.sitter_primary_services?.[0];

  if (!primaryService) {
    console.error('Sitter has no primary service');
    return;
  }
  
  console.log(`Found Sitter: ${sitter.id}, Service: ${primaryService.id}, Price: ${primaryService.price_cents}`);

  // Create a dummy customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
        name: 'Test Cost Customer',
        email: `test_cost_${Date.now()}@example.com`
    })
    .select()
    .single();

  if (customerError) {
    console.error('Error creating customer:', customerError);
    return;
  }

  console.log(`Created Customer: ${customer.id}`);

  // Create Booking Request
  const startDate = '2025-06-01';
  const endDate = '2025-06-03'; // 2 nights
  const { data: booking, error: bookingError } = await supabase
    .from('booking_requests')
    .insert({
        customer_id: customer.id,
        start_date: startDate,
        end_date: endDate,
        sitter_service_id: primaryService.id, // Important for new logic
        status: 'PENDING_SITTER_ACCEPTANCE'
    })
    .select()
    .single();

  if (bookingError) {
    console.error('Error creating booking:', bookingError);
    return;
  }
  console.log(`Created Booking: ${booking.id}`);

  // 1. Test Calculation RPC
  console.log('🧮 Testing calculate_booking_cost RPC...');
  const { data: costData, error: calcError } = await supabase
    .rpc('calculate_booking_cost', {
        booking_id: booking.id,
        sitter_profile_id: sitter.id, 
        p_service_primary_id: primaryService.id
    });

  if (calcError) {
    console.error('Error calculating cost:', calcError);
  } else {
    console.log('Calculation Result:', JSON.stringify(costData, null, 2));
    
    // Assertions
    const days = 2; // June 1 to June 3 is 2 nights
    const base = primaryService.price_cents * days;
    const expectedOwnerFee = Math.round(base * 0.07);
    const expectedPlatformFee = expectedOwnerFee + Math.round(base * 0.15); // + addons * 0
    const expectedTotal = base + expectedOwnerFee;
    
    console.log('--- Expected Values ---');
    console.log(`Base (${days} days @ ${primaryService.price_cents}): ${base}`);
    console.log(`Owner Fee (7%): ${expectedOwnerFee}`);
    console.log(`Total Cost: ${expectedTotal}`);
    console.log(`Platform Fee (7% Owner + 15% Sitter): ${expectedPlatformFee}`);
  }

  // 2. Test Acceptance RPC
  console.log('🤝 Testing accept_booking_request RPC...');
  const { error: acceptError } = await supabase
    .rpc('accept_booking_request', {
        booking_id: booking.id,
        sitter_user_id: sitter.user_id
    });

  if (acceptError) {
    console.error('Error accepting booking:', acceptError);
  } else {
    console.log('Booking accepted successfully.');
    
    const { data: updatedBooking } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('id', booking.id)
        .single();
        
    console.log('Updated Booking Record:', JSON.stringify({
        total_cost_cents: updatedBooking.total_cost_cents,
        owner_service_fee_cents: updatedBooking.owner_service_fee_cents,
        platform_fee_cents: updatedBooking.platform_fee_cents,
        sitter_payout_cents: updatedBooking.sitter_payout_cents
    }, null, 2));
  }

  // Teardown
  if (booking && booking.id) {
    console.log('🧹 Cleaning up test booking:', booking.id);
    await supabase.from('booking_requests').delete().eq('id', booking.id);
  }
}

testCostLogic();
