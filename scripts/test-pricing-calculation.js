
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// --- Configuration ---
const BASE_URL = 'http://localhost:3001/api';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase URL or anonymous key.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Test Data (from supabase/seed.sql) ---
const SITTER_USER_EMAIL = 'sitter1@mailinator.com';
const SITTER_PASSWORD = 'password';

// Function to generate a random string for unique emails
const randomString = () => Math.random().toString(36).substring(7);

async function testPricingCalculation() {
  let bookingId;
  try {
    // --- Step 1: Authenticate as the Sitter ---
    console.log(`Authenticating as sitter: ${SITTER_USER_EMAIL}...`);
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: SITTER_USER_EMAIL,
      password: SITTER_PASSWORD,
    });

    if (signInError) {
      throw new Error(`Sitter sign-in failed: ${signInError.message}`);
    }
    if (!session) {
      throw new Error('Sitter sign-in failed: No session returned.');
    }
    console.log('Sitter authenticated successfully.');
    const sitterAuthToken = session.access_token;
    const sitterUserId = session.user.id;

    // --- Step 2: Get Sitter Profile and Addon IDs ---
    console.log('\nFetching sitter profile and addon data...');
    const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: sitterProfile, error: sitterProfileError } = await supabaseAdmin
        .from('sitters')
        .select('id')
        .eq('user_id', sitterUserId)
        .single();

    if (sitterProfileError) throw new Error(`Could not fetch sitter profile: ${sitterProfileError.message}`);
    const sitterProfileId = sitterProfile.id;

    const { data: addons, error: addonError } = await supabaseAdmin
        .from('sitter_addons')
        .select('id, name')
        .eq('sitter_id', sitterProfileId)
        .in('name', ['Daily Walk', 'Grooming']);

    if (addonError) throw new Error(`Could not fetch addons: ${addonError.message}`);
    const addonIds = addons.map(a => a.id);

    console.log(`Found Sitter Profile ID: ${sitterProfileId}`);
    console.log(`Found Addon IDs: ${addonIds.join(', ')}`);


    // --- Step 3: Create a new booking request ---
    console.log('\nCreating a new booking request for 8 nights with 2 add-ons...');
    const bookingPayload = {
      customer: {
        name: 'Pricing Test Customer',
        email: `pricing-test-${randomString()}@example.com`,
      },
      pet: {
        name: 'Fido',
        breed: 'Corgi',
        age: 2,
        notes: 'Likes to nap.',
      },
      booking: {
        start_date: '2025-11-10',
        end_date: '2025-11-18', // 8 nights
        county: 'County One',
      },
      selected_sitter_ids: [sitterProfileId],
      selected_addon_ids: addonIds,
    };

    const createRes = await fetch(`${BASE_URL}/booking-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    });

    if (!createRes.ok) {
      const errorBody = await createRes.text();
      throw new Error(`Failed to create booking: ${createRes.status} ${errorBody}`);
    }

    const createJson = await createRes.json();
    bookingId = createJson.bookingId;
    console.log(`Booking request created successfully! Booking ID: ${bookingId}`);

    // --- Step 4: Accept the booking as the sitter ---
    console.log('\nAccepting the booking as the authenticated sitter...');
    const acceptRes = await fetch(`${BASE_URL}/sitter/accept-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sitterAuthToken}`,
      },
      body: JSON.stringify({ bookingId }),
    });

    if (!acceptRes.ok) {
        const errorBody = await acceptRes.text();
        throw new Error(`Failed to accept booking: ${acceptRes.status} ${errorBody}`);
    }

    console.log('Booking accepted successfully!');

    // --- Step 5: Verify the calculated price in the database ---
    console.log('\nVerifying the calculated price in the database...');
    const { data: bookingData, error: fetchError } = await supabaseAdmin
      .from('booking_requests')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch booking data: ${fetchError.message}`);
    }

    console.log('\n--- Pricing Calculation Verification ---');
    console.log(`Booking ID: ${bookingData.id}`);
    console.log('----------------------------------------');
    console.log(`Base Rate (cents):      ${bookingData.base_rate_at_booking_cents}`);
    console.log(`Add-ons Total (cents):  ${bookingData.addons_total_cost_cents}`);
    console.log(`Discount Applied (cents): ${bookingData.discount_applied_cents}`);
    console.log('----------------------------------------');
    console.log(`Total Cost (cents):     ${bookingData.total_cost_cents}`);
    console.log('----------------------------------------\n');

    // Expected calculation:
    // 8 nights * $50/night = $400 (40000 cents)
    // Addons: Daily Walk ($10) + Grooming ($25) = $35 (3500 cents)
    // Sub-total: 43500 cents
    // Discount: 10% of 40000 = 4000 cents
    // Total: 43500 - 4000 = 39500 cents
    const expectedTotal = (8 * 5000) + 1000 + 2500 - 4000;
    if (bookingData.total_cost_cents === expectedTotal) {
        console.log('✅ SUCCESS: Calculated total matches expected total.');
    } else {
        console.error(`❌ FAILURE: Calculated total ${bookingData.total_cost_cents} does not match expected total ${expectedTotal}.`);
    }


  } catch (error) {
    console.error('\nAn error occurred during the test:');
    console.error(error);
    if (bookingId) {
        console.error(`Error occurred for booking ID: ${bookingId}`);
    }
  }
}

testPricingCalculation();
