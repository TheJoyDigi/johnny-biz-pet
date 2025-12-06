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

const sittersPath = path.join(__dirname, '../data/sitters.json');
const sittersData = JSON.parse(fs.readFileSync(sittersPath, 'utf8'));

const cityCountyMap = {
    'Irvine': 'Orange',
    'Wildomar': 'Riverside'
};

async function migrate() {
  for (const sitter of sittersData) {
    console.log(`Processing sitter: ${sitter.name}`);

    // 1. Create/Get User
    // Using generic emails for sitters based on UID to avoid using personal emails in dev/migration
    const email = `${sitter.uid}@ruhrohretreat.com`; 
    const password = 'tempPassword123!'; 

    // Check if user exists in auth
    const { data: { users }, error: userListError } = await supabase.auth.admin.listUsers();
    
    let userId;
    const existingUser = users?.find(u => u.email === email);

    if (existingUser) {
        userId = existingUser.id;
        console.log(`User already exists: ${userId}`);
    } else {
        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { first_name: sitter.name, last_name: '(Sitter)' }
        });

        if (authError) {
            console.error(`Error creating auth user for ${sitter.name}:`, authError.message);
            continue;
        }
        userId = authUser.user.id;
        console.log(`Created auth user: ${userId}`);
    }

    // Ensure public.users record exists
    const { error: userError } = await supabase.from('users').upsert({
        id: userId,
        email: email,
        first_name: sitter.name,
        role: 'SITTER'
    });
     if (userError) {
        console.error(`Error creating public user for ${sitter.name}:`, userError.message);
    }

    // 2. Upsert Sitter Profile
    const city = sitter.locations[0]?.city;
    const county = cityCountyMap[city] || sitter.locations[0]?.state;

    const sitterData = {
        user_id: userId,
        slug: sitter.id, // json 'id' is the slug like 'johnny-irvine'
        is_active: true,
        address: city, 
        county: county,
        base_rate_cents: parseInt(sitter.services.primary[0].price.replace(/\D/g, '')) * 100,
        tagline: sitter.tagline,
        avatar_url: sitter.avatar,
        hero_image_url: sitter.heroImage,
        bio: sitter.bio,
        skills: sitter.skills,
        home_environment: sitter.homeEnvironment,
        badges: sitter.badges,
        policies: sitter.policies,
        location_details: sitter.locations[0]
    };

    const { data: sitterRecord, error: sitterError } = await supabase
        .from('sitters')
        .upsert(sitterData, { onConflict: 'user_id' })
        .select()
        .single();

    if (sitterError) {
        console.error(`Error upserting sitter ${sitter.name}:`, sitterError.message);
        continue;
    }
    
    const sitterId = sitterRecord.id;
    console.log(`Upserted sitter record: ${sitterId}`);

    // 3. Upsert Addons
    if (sitter.services.addOns) {
        // Delete existing addons for this sitter
        await supabase.from('sitter_addons').delete().eq('sitter_id', sitterId);
        
        const addonsToInsert = [];
        for (const category of sitter.services.addOns) {
            for (const item of category.items) {
                // Handle price extraction, some might be "varies" or range, assuming standard format for now
                // But checking logs if NaN
                let price = 0;
                if (item.price) {
                    const priceStr = item.price.replace(/\D/g, '');
                    if (priceStr) price = parseInt(priceStr) * 100;
                }

                addonsToInsert.push({
                    sitter_id: sitterId,
                    name: item.name,
                    description: item.description,
                    price_cents: price
                });
            }
        }
        if (addonsToInsert.length) {
             const { error: addonInsertError } = await supabase.from('sitter_addons').insert(addonsToInsert);
             if (addonInsertError) console.error('Error inserting addons:', addonInsertError.message);
        }
    }

    // 4. Upsert Discounts
    if (sitter.discounts) {
        await supabase.from('sitter_discounts').delete().eq('sitter_id', sitterId);
        const discountsToInsert = [];
        // Length of stay
        if (sitter.discounts.lengthOfStay) {
             for (const discount of sitter.discounts.lengthOfStay) {
                 if (discount.detail.includes('% off')) {
                     const percentStr = discount.detail.match(/(\d+)%/);
                     const percent = percentStr ? parseInt(percentStr[1]) : 0;
                     
                     // parse min days from label "7-13 nights" -> 7, "14+ nights" -> 14
                     const minDaysMatch = discount.label.match(/(\d+)/);
                     if (minDaysMatch && percent) {
                         discountsToInsert.push({
                             sitter_id: sitterId,
                             min_days: parseInt(minDaysMatch[0]),
                             percentage: percent
                         });
                     }
                 }
             }
        }
        if (discountsToInsert.length) {
             const { error: discountError } = await supabase.from('sitter_discounts').insert(discountsToInsert);
             if (discountError) console.error('Error inserting discounts:', discountError.message);
        }
    }
  }
  console.log('Migration complete');
}

migrate().catch(console.error);
