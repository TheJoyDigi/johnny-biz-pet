const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
// const mime = require('mime-types'); // Removed dependency
// Load .env.local, but do not override existing environment variables
require('dotenv').config({ path: '.env.local' });

// Allow CLI-provided variables to take precedence (standard Node behavior), 
// but ensure we're looking at the right names.
const supabaseUrl = process.env.PROD_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.PROD_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BUCKET_NAME = 'sitter-images';
const LOCAL_SITTERS_DIR = path.join(__dirname, '../public/sitters');

async function uploadFile(localPath, storagePath, contentType) {
    const fileContent = fs.readFileSync(localPath);
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileContent, {
            contentType: contentType,
            upsert: true
        });
    
    if (error) {
        console.error(`Error uploading ${storagePath}:`, error.message);
        return null;
    }
    
    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    return publicUrl;
}

async function migrateImages() {
    // 1. Create Bucket
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) console.error('Error listing buckets:', listError);
    
    const bucketExists = buckets?.find(b => b.name === BUCKET_NAME);
    if (!bucketExists) {
        console.log(`Creating bucket '${BUCKET_NAME}'...`);
        const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true
        });
        if (error) {
            console.error('Error creating bucket:', error.message);
            // Proceeding anyway in case it exists but listing failed (RLS?) or I can't create it
        }
    } else {
        console.log(`Bucket '${BUCKET_NAME}' exists.`);
    }

    // 2. Iterate Sitters
    const sittersDirs = fs.readdirSync(LOCAL_SITTERS_DIR).filter(file => {
        return fs.statSync(path.join(LOCAL_SITTERS_DIR, file)).isDirectory();
    });

    for (const uid of sittersDirs) {
        console.log(`Processing sitter: ${uid}`);
        
        // Find sitter ID in DB by legacy UID mapping (or slug)
        // Legacy logic: sr-001 -> johnny-irvine, sr-002 -> trudy-wildomar
        let slug = '';
        if (uid === 'sr-001') slug = 'johnny-irvine';
        if (uid === 'sr-002') slug = 'trudy-wildomar';

        const { data: sitterRecord, error: sitterError } = await supabase
            .from('sitters')
            .select('id')
            .eq('slug', slug)
            .single();

        if (sitterError || !sitterRecord) {
            console.error(`Sitter record not found for slug ${slug} (uid ${uid})`);
            continue;
        }

        const sitterId = sitterRecord.id;
        const sitterDir = path.join(LOCAL_SITTERS_DIR, uid);
        const files = fs.readdirSync(sitterDir);

        // Upload Avatar & Hero
        for (const file of files) {
            const filePath = path.join(sitterDir, file);
            if (fs.statSync(filePath).isDirectory()) continue; // Skip gallery dir for now

            if (file.includes('avatar') || file.includes('hero') || file.includes('profile')) {
                const ext = path.extname(file).toLowerCase();
                let type = 'avatar';
                if (file.includes('hero')) type = 'hero';
                
                const contentType = ext === '.png' ? 'image/png' : 'image/jpeg'; // Simple mime check
                const storagePath = `${uid}/${type}${ext}`;
                
                console.log(`Uploading ${file} to ${storagePath}...`);
                const publicUrl = await uploadFile(filePath, storagePath, contentType);

                if (publicUrl) {
                    const updateData = {};
                    if (type === 'avatar') updateData.avatar_url = publicUrl;
                    if (type === 'hero') updateData.hero_image_url = publicUrl;

                    await supabase.from('sitters').update(updateData).eq('id', sitterId);
                    console.log(`Updated ${type} URL for ${slug}`);
                }
            }
        }

        // Upload Gallery
        const galleryDir = path.join(sitterDir, 'gallery');
        if (fs.existsSync(galleryDir)) {
            const galleryFiles = fs.readdirSync(galleryDir);
            for (const file of galleryFiles) {
                if (file === '.DS_Store') continue;
                const filePath = path.join(galleryDir, file);
                const ext = path.extname(file).toLowerCase();
                const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
                const storagePath = `${uid}/gallery/${file}`;

                console.log(`Uploading gallery/${file} to ${storagePath}...`);
                await uploadFile(filePath, storagePath, contentType);
            }
        }
    }
    console.log('Image migration complete.');
}

migrateImages().catch(console.error);
