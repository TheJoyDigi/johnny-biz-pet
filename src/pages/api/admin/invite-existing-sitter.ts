import { createClient } from '@supabase/supabase-js';
import { type NextApiRequest, type NextApiResponse } from 'next';
import { isAdmin } from '@/utils/api/is-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdminUser = await isAdmin(req, res);
  if (!isAdminUser) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { sitterId, email, firstName, lastName } = req.body;

  if (!sitterId || !email) {
    return res.status(400).json({ message: 'Sitter ID and Email are required.' });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Check if sitter exists and is unclaimed
  const { data: sitter, error: sitterFetchError } = await supabaseAdmin
    .from('sitters')
    .select('id, user_id')
    .eq('id', sitterId)
    .single();

  if (sitterFetchError || !sitter) {
    return res.status(404).json({ message: 'Sitter not found' });
  }

  if (sitter.user_id) {
    return res.status(400).json({ message: 'Sitter already has a user account linked.' });
  }

  // 2. Create the auth user
  const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
  
  const { data: { user }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName }
  });

  if (createUserError) {
    return res.status(500).json({ message: `Failed to create user: ${createUserError.message}` });
  }
  if (!user) {
    return res.status(500).json({ message: 'User not created' });
  }

  // 3. Create public.users record
  const { error: updateUserError } = await supabaseAdmin
    .from('users')
    .upsert({ 
      id: user.id,
      email: email,
      first_name: firstName,
      last_name: lastName,
      role: 'SITTER'
    });

  if (updateUserError) {
     await supabaseAdmin.auth.admin.deleteUser(user.id);
     return res.status(500).json({ message: `Failed to create user record: ${updateUserError.message}` });
  }

  // 4. Link User to Sitter
  const { error: linkError } = await supabaseAdmin
    .from('sitters')
    .update({ user_id: user.id })
    .eq('id', sitterId);

  if (linkError) {
    // Determine rollover strategy. For now, manual intervention might be needed, 
    // or we delete the user. 
    await supabaseAdmin.from('users').delete().eq('id', user.id);
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    return res.status(500).json({ message: `Failed to link sitter to user: ${linkError.message}` });
  }

  // 5. Send Invite Email
  const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,
  });

  if (resetError) {
      return res.status(200).json({ message: `Sitter linked but failed to send email: ${resetError.message}` });
  }

  res.status(200).json({ message: 'Sitter invited and account linked successfully' });
}
