
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Config
const SUPABASE_URL = process.env.PROD_SUPABASE_URL;
const SERVICE_KEY = process.env.PROD_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Error: PROD_SUPABASE_URL and PROD_SUPABASE_SERVICE_KEY are required.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const SITTERS_FILE = path.join(__dirname, '../data/sitters.json');
const sittersData = JSON.parse(fs.readFileSync(SITTERS_FILE, 'utf-8'));

async function seed() {
    console.log('Starting Remote Seed...');
    
    // 1. Nuke Data
    console.log('Wiping database...');
    const { error: rpcError } = await supabase.rpc('admin_nuke_data');
    if (rpcError) {
        console.error('Error wiping data:', rpcError);
        // Fallback: If function doesn't exist (migrations not applied?), we fail.
        process.exit(1);
    }
    console.log('Database wiped.');

    // 2. Service Types
    console.log('Creating Service Types...');
    const { data: serviceTypes, error: stError } = await supabase
        .from('service_types')
        .insert([
            { name: 'Dog Boarding', slug: 'dog-boarding', description: 'Overnight stays' },
            { name: 'Doggy Daycare', slug: 'doggy-daycare', description: 'Daytime care' }
        ])
        .select();
    
    if (stError) throw new Error('Error creating service types: ' + stError.message);
    
    const boardingId = serviceTypes.find(s => s.slug === 'dog-boarding').id;
    const daycareId = serviceTypes.find(s => s.slug === 'doggy-daycare').id;

    // 3. Admin User
    console.log('Creating Admin User...');
    const adminEmail = 'admin@ruhrohretreat.com';
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: 'rrradmin', // Default password
        email_confirm: true,
        user_metadata: { first_name: 'Admin', last_name: 'User' }
    });
    
    if (adminError) throw new Error('Error creating admin auth: ' + adminError.message);

    const { error: adminProfileError } = await supabase
        .from('users')
        .insert({
            id: adminUser.user.id,
            email: adminEmail,
            first_name: 'Admin',
            last_name: 'User',
            role: 'ADMIN'
        });

    if (adminProfileError) throw new Error('Error creating admin profile: ' + adminProfileError.message);


    // 4. Sitters
    for (const s of sittersData) {
        console.log(`Creating Sitter: ${s.name}...`);
        
        // Create Auth User
        const email = `${s.name.toLowerCase()}@ruhrohretreat.com`;
        const { data: userAuth, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: 'password123',
            email_confirm: true,
            user_metadata: { first_name: s.name, last_name: 'Sitter' }
        });

        if (authError) {
            console.error(`Failed to create auth for ${s.name}:`, authError.message);
            continue;
        }

        const userId = userAuth.user.id;
        
        // Public User Profile
        await supabase.from('users').insert({
            id: userId,
            email: email,
            first_name: s.name,
            last_name: 'Sitter',
            role: 'SITTER'
        });

        // Sitter Profile
        const { data: sitterProfile, error: profileError } = await supabase
            .from('sitters')
            .insert({
                user_id: userId,
                slug: s.id, // e.g. johnny-irvine
                tagline: s.tagline,
                avatar_url: s.avatar, // Placeholder, will be updated by image migration
                hero_image_url: s.heroImage,
                bio: s.bio,
                care_style: s.careStyle,
                parent_expectations: s.parentExpectations,
                skills: s.skills,
                home_environment: s.homeEnvironment,
                badges: s.badges,
                policies: s.policies,
                lat: s.locations?.[0]?.lat,
                lng: s.locations?.[0]?.lng,
                location: s.locations?.[0] ? `POINT(${s.locations[0].lng} ${s.locations[0].lat})` : null, // PostGIS
                location_details: s.locations?.[0] || {},
                is_active: true
            })
            .select()
            .single();

        if (profileError) {
            console.error(`Failed to create sitter profile for ${s.name}:`, profileError.message);
            continue;
        }
        
        const sitterId = sitterProfile.id;

        // Primary Services
        if (s.services?.primary) {
            const servicesToInsert = s.services.primary.map(svc => {
                const typeId = svc.name.toLowerCase().includes('daycare') ? daycareId : boardingId;
                const priceMatch = svc.price?.match(/\$(\d+)/);
                const priceCents = priceMatch ? parseInt(priceMatch[1]) * 100 : 0;
                return {
                    sitter_id: sitterId,
                    service_type_id: typeId,
                    price_cents: priceCents
                };
            });
            await supabase.from('sitter_primary_services').insert(servicesToInsert);
        }

        // Addons
        if (s.services?.addOns) {
            const addonsToInsert = [];
            s.services.addOns.forEach(cat => {
                cat.items.forEach(item => {
                    const priceMatch = item.price?.match(/\$(\d+)/);
                    const priceCents = priceMatch ? parseInt(priceMatch[1]) * 100 : 0;
                    addonsToInsert.push({
                        sitter_id: sitterId,
                        name: item.name,
                        description: item.description || item.name,
                        price_cents: priceCents
                    });
                });
            });
            await supabase.from('sitter_addons').insert(addonsToInsert);
        }

        // Discounts
        if (s.discounts?.lengthOfStay) {
            const discountsToInsert = [];
            s.discounts.lengthOfStay.forEach(d => {
                let minDays = 0;
                // Parse "7-13 nights", "14+ nights"
                if (d.label.includes('+')) {
                    minDays = parseInt(d.label);
                } else if (d.label.includes('–') || d.label.includes('-')) {
                    const parts = d.label.split(/[–-]/);
                    minDays = parseInt(parts[0]);
                }

                const pctMatch = d.detail.match(/(\d+)%/);
                const percentage = pctMatch ? parseInt(pctMatch[1]) : 0;

                if (minDays > 0 && percentage > 0) {
                    discountsToInsert.push({
                        sitter_id: sitterId,
                        min_days: minDays,
                        percentage: percentage
                    });
                }
            });
            await supabase.from('sitter_discounts').insert(discountsToInsert);
        }
    }

    // 5. Reviews
    const REVIEWS_FILE = path.join(__dirname, '../data/reviews.json');
    if (fs.existsSync(REVIEWS_FILE)) {
        console.log('Seeding Reviews from data/reviews.json...');
        const reviewsData = JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf-8'));
        
        // Lookup map for sitter slug -> id
        const { data: sitters } = await supabase.from('sitters').select('id, slug');
        const sitterMap = {};
        sitters.forEach(s => sitterMap[s.slug] = s.id);

        const reviewsToInsert = reviewsData.map(r => {
            const sitterId = sitterMap[r.sitter_slug];
            if (!sitterId) {
                console.warn(`Skipping review for unknown sitter slug: ${r.sitter_slug}`);
                return null;
            }
            return {
                sitter_id: sitterId,
                client_name: r.client_name,
                pet_name: r.pet_name,
                rating: r.rating,
                date: r.date,
                text: r.text,
                image_url: r.image_url,
                created_at: r.created_at
            };
        }).filter(r => r !== null);

        if (reviewsToInsert.length > 0) {
            const { error: reviewError } = await supabase.from('sitter_reviews').insert(reviewsToInsert);
            if (reviewError) {
                console.error('Error inserting reviews:', reviewError.message);
            } else {
                console.log(`Inserted ${reviewsToInsert.length} reviews.`);
            }
        }
    } else {
        console.log('No data/reviews.json found, skipping review seeding.');
    }
}

seed().catch(err => {
    console.error('Seed Failed:', err);
    process.exit(1);
});
