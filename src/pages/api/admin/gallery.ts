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

    const getFolder = (slug: string) => {
        if (slug === 'johnny-irvine') return 'sr-001';
        if (slug === 'trudy-wildomar') return 'sr-002';
        return slug;
    };

    if (req.method === 'GET') {
        const { slug } = req.query;
        if (!slug) return res.status(400).json({ error: 'Slug required' });

        const folder = getFolder(slug as string);
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
            
            if (!slug || !file) return res.status(400).json({ error: 'Missing slug or file' });

            const folder = getFolder(slug);
            const fileContent = fs.readFileSync(file.filepath);
            
            const { error } = await supabase.storage
                .from(bucket)
                .upload(`${folder}/gallery/${file.originalFilename}`, fileContent, {
                    contentType: file.mimetype || 'image/jpeg',
                    upsert: true
                });
            
            if (error) return res.status(500).json({ error: error.message });
            return res.json({ success: true });

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

        const folder = getFolder(slug);
        const { error } = await supabase.storage
            .from(bucket)
            .remove([`${folder}/gallery/${filename}`]);

        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
