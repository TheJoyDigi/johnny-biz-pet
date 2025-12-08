import { createClient } from '@supabase/supabase-js';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { isAdmin } from '@/utils/api/is-admin';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
    if (!await isAdmin(req, res)) return res.status(401).json({error: 'Unauthorized'});

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const bucket = 'sitter-images';

    const getSitterId = async (slug: string) => {
        const { data, error } = await supabase.from('sitters').select('id').eq('slug', slug).single();
        if (error || !data) throw new Error(`Sitter not found for slug: ${slug}`);
        return data.id;
    };

    if (req.method === 'GET') {
        const { slug } = req.query;
        if (!slug) return res.status(400).json({ error: 'Slug required' });

        const folder = await getSitterId(slug as string);
        const { data, error } = await supabase.storage.from(bucket).list(`${folder}/gallery`);
        
        if (error) return res.status(500).json({ error: error.message });
        
        const images = data
            .filter(f => f.name !== '.DS_Store')
            .map(f => ({
                name: f.name,
                url: supabase.storage.from(bucket).getPublicUrl(`${folder}/gallery/${f.name}`).data.publicUrl
            }));
        return res.json({ images });
    }

    if (req.method === 'POST') {
        const form = new IncomingForm();
        try {
            const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
                form.parse(req, (err, fields, files) => {
                    if (err) reject(err);
                    resolve([fields, files]);
                });
            });

            const slug = fields.slug?.[0];
            const file = files.file?.[0];
            const type = fields.type?.[0] || 'gallery';
            
            if (!slug || !file) return res.status(400).json({ error: 'Missing slug or file' });

            const folder = await getSitterId(slug);
            const fileContent = fs.readFileSync(file.filepath);

            // Determine subfolder based on type
            const subfolder = (type === 'avatar' || type === 'hero') ? type : 'gallery';
            
            const { error } = await supabase.storage
                .from(bucket)
                .upload(`${folder}/${subfolder}/${file.originalFilename}`, fileContent, {
                    contentType: file.mimetype || 'image/jpeg',
                    upsert: true
                });
            
            if (error) return res.status(500).json({ error: error.message });

            // Revalidate the sitter page so the public sees changes immediately
            try {
                await res.revalidate(`/sitters/${slug}`);
            } catch (revalError) {
                console.warn(`Failed to revalidate /sitters/${slug}:`, revalError);
            }

            return res.json({ success: true, url: supabase.storage.from(bucket).getPublicUrl(`${folder}/${subfolder}/${file.originalFilename}`).data.publicUrl });

        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method === 'DELETE') {
        // Parse body manually since bodyParser is false
        const buffers = [];
        for await (const chunk of req) {
            buffers.push(chunk);
        }
        const data = JSON.parse(Buffer.concat(buffers).toString());
        const { slug, filename } = data;

        if (!slug || !filename) return res.status(400).json({ error: 'Missing slug or filename' });

        const folder = await getSitterId(slug);
        const { error } = await supabase.storage
            .from(bucket)
            .remove([`${folder}/gallery/${filename}`]);

        if (error) return res.status(500).json({ error: error.message });

        // Revalidate the sitter page
        try {
            await res.revalidate(`/sitters/${slug}`);
        } catch (revalError) {
            console.warn(`Failed to revalidate /sitters/${slug}:`, revalError);
        }

        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
