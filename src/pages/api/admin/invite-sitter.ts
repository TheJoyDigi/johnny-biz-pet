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

  const { email, firstName, lastName, sendInvite = true } = req.body;

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ message: 'Email, first name, and last name are required.' });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Create the auth user
  // Providing a temporary random password to ensure creation works without sending a magic link immediately
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

  // 2. Create or update the public.users table
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
    return res.status(500).json({ message: `Failed to update user profile: ${updateUserError.message}` });
  }

  // 3. Create the corresponding row in the sitters table
  const { error: sitterError } = await supabaseAdmin
    .from('sitters')
    .insert({ user_id: user.id });

  if (sitterError) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    return res.status(500).json({ message: `Failed to create sitter profile: ${sitterError.message}` });
  }

  // 4. Send the password setup email ONLY if requested
  if (sendInvite) {
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,
    });

    if (resetError) {
        // Don't delete user here, just report error, as profile is created
        return res.status(200).json({ message: `Sitter created but failed to send email: ${resetError.message}` });
    }
  }

  res.status(200).json({ message: sendInvite ? 'Sitter invited successfully' : 'Sitter profile created successfully (no email sent)' });
}
