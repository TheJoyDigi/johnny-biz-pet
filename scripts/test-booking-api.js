const fetch = require('node-fetch'); // Ensure node-fetch is installed or use global fetch if node 18+
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client to get dynamic data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestBooking() {
  console.log('🚀 Preparing test booking request...');

  // 1. Get a Sitter and their primary service
  const { data: sitters, error: sitterError } = await supabase
    .from("sitters")
    .select(`
        id, 
        user_id, 
        users(first_name, last_name),
        sitter_primary_services (id, price_cents, service_types(slug))
    `)
    .limit(1)
    .single();

  if (sitterError || !sitters) {
      console.error("Failed to fetch a sitter:", sitterError);
      return;
  }

  const sitterId = sitters.id;
  const sitterName = `${sitters.users.first_name} ${sitters.users.last_name}`;
  // Pick first service
  const primaryService = sitters.sitter_primary_services[0];
  const serviceId = primaryService?.id || "dog-boarding"; // Use ID if available

  console.log(`✅ Using Sitter: ${sitterName} (${sitterId})`);
  console.log(`✅ Using Service ID: ${serviceId}`);

  // 2. Payload
  const payload = {
    sitterId: sitterId,
    sitterName: sitterName,
    locationName: "Irvine, CA",
    serviceId: serviceId,
    firstName: "TestScript",
    lastName: "User",
    "email": "c@mailinator.com",
  "phone": "555-999-8888",
  "petName": "ScriptDog",
  "petType": "dog",
  "startDate": "2025-12-20",
  "startTime": "09:00",
  "endDate": "2025-12-23",
  "endTime": "17:00",
  "addons": {
    "e0b5756c-4410-491c-b493-5d612c46e70f": 1, // One-On-One Fetch
    "856f46ea-f8f3-408e-9950-f63eb06ad14a": 2, // Bubble Play Session
    "24551b3c-f550-45ef-a1f9-2d9e99519dd5": 1  // "Adventure Drive" Car Ride
  },
    notes: "Created via automated test script",
    referralSource: "Script"
  };

  console.log("📦 Payload:", JSON.stringify(payload, null, 2));

  // 3. Send Request
  // Default to 3001 as per package.json
  const API_URL = 'http://localhost:3001/api/booking';
  
  try {
      const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log(`📡 Response Status: ${res.status}`);
      console.log(`📄 Response Data:`, data);

      if (data.success) {
          console.log("🎉 Booking Request Created Successfully!");
      } else {
          console.error("❌ Failed to create booking.");
      }

  } catch (err) {
      console.error("❌ Error sending request:", err);
  }
}

createTestBooking();
