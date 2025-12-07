const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const johnnyReviewsPath = path.join(__dirname, '../public/sitters/sr-001/reviews/reviews.json');
const trudyReviewsPath = path.join(__dirname, '../public/sitters/sr-002/reviews/reviews.json');

async function migrateReviews() {
  // 1. Get Sitter IDs
  const { data: sitters, error: sitterError } = await supabase.from('sitters').select('id, slug');
  if (sitterError) {
    console.error('Error fetching sitters:', sitterError);
    return;
  }

  const johnny = sitters.find(s => s.slug === 'johnny-irvine');
  const trudy = sitters.find(s => s.slug === 'trudy-wildomar');

  if (!johnny || !trudy) {
    console.error('Could not find Johnny or Trudy in database');
    return;
  }

  // 2. Process Johnny's Reviews
  if (fs.existsSync(johnnyReviewsPath)) {
    const johnnyReviews = JSON.parse(fs.readFileSync(johnnyReviewsPath, 'utf8'));
    console.log(`Found ${johnnyReviews.length} reviews for Johnny`);
    
    const johnnyInserts = johnnyReviews.map(r => ({
      sitter_id: johnny.id,
      client_name: r.name,
      rating: r.rating,
      date: new Date(r.date).toISOString(),
      text: r.text,
      pet_name: r.pet || '', 
      source: r.service || 'Rover', // Defaulting to Rover as per testimonials.ts logic
      image_url: r.image || null
    }));

    const { error: jError } = await supabase.from('sitter_reviews').insert(johnnyInserts);
    if (jError) console.error('Error inserting Johnny reviews:', jError);
    else console.log('Inserted Johnny reviews');
  }

  // 3. Process Trudy's Reviews
  if (fs.existsSync(trudyReviewsPath)) {
    const trudyReviews = JSON.parse(fs.readFileSync(trudyReviewsPath, 'utf8'));
    console.log(`Found ${trudyReviews.length} reviews for Trudy`);

    const trudyInserts = trudyReviews.map(r => ({
      sitter_id: trudy.id,
      client_name: r.name,
      rating: r.rating,
      date: new Date(r.date).toISOString(),
      text: r.text,
      pet_name: r.pet || 'Guest Pup', // Default as per testimonials.ts logic
      source: r.service || 'Community',
      image_url: r.image || null
    }));

    const { error: tError } = await supabase.from('sitter_reviews').insert(trudyInserts);
    if (tError) console.error('Error inserting Trudy reviews:', tError);
    else console.log('Inserted Trudy reviews');
  }
}

migrateReviews().catch(console.error);
