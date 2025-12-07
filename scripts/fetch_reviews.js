const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Hardcoded Dev Credentials (since .env.local might point to Prod)
const SUPABASE_URL = 'https://dsnjzdtfezcsctdjlsje.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbmp6ZHRmZXpjc2N0ZGpsc2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjIzMTEsImV4cCI6MjA3NTQzODMxMX0.-a8GR4oTnCj9eHPddl7vHLiVeNTZle3Reqdhm4eTfl8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchReviews() {
  console.log('Fetching reviews from DEV...');
  
  // Join with sitters to get slug
  // We explicitly select columns to match seed expectations
  const { data, error } = await supabase
    .from('sitter_reviews')
    .select(`
      client_name,
      pet_name,
      rating,
      date,
      text,
      image_url,
      created_at,
      sitters (
        slug
      )
    `);

  if (error) {
    console.error('Error fetching reviews:', error);
    process.exit(1);
  }

  // Transform: flatten sitters.slug to sitter_slug
  const reviews = data.map(r => {
    const { sitters, source, ...rest } = r; // Exclude source if present in data object implicitly
    return {
      ...rest,
      sitter_slug: sitters?.slug
      // source is excluded
    };
  }).filter(r => r.sitter_slug); // Ensure we have a slug

  const outFile = path.join(process.cwd(), 'data', 'reviews.json');
  fs.writeFileSync(outFile, JSON.stringify(reviews, null, 2));
  console.log(`Saved ${reviews.length} reviews to data/reviews.json`);
}

fetchReviews();
