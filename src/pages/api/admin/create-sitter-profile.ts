import { createClient } from '@supabase/supabase-js';
import { type NextApiRequest, type NextApiResponse } from 'next';
import { isAdmin } from '@/utils/api/is-admin';
import slugify from 'slugify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdminUser = await isAdmin(req, res);
  if (!isAdminUser) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'First name and last name are required.' });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Generate a base slug
  let slug = slugify(`${firstName}-${lastName}`, { lower: true, strict: true });
  
  // Check for uniqueness and append suffix if needed
  // Simple check - for production might want a loop or stricter logic
  const { data: existingSlug } = await supabaseAdmin
    .from('sitters')
    .select('slug')
    .eq('slug', slug)
    .single();

  if (existingSlug) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }

  // Create the sitter profile
  const { data, error } = await supabaseAdmin
    .from('sitters')
    .insert({
      first_name: firstName,
      last_name: lastName,
      contact_email: email || null,
      slug: slug,
      is_active: false // Default to inactive until approved/setup?
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: `Failed to create sitter profile: ${error.message}` });
  }

  res.status(200).json({ message: 'Sitter profile created successfully', sitter: data });
}
