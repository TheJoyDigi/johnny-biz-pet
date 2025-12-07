import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from '@/utils/api/is-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdminUser = await isAdmin(req, res);
  if (!isAdminUser) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { user_id, sitter_id } = req.body;

  if (!user_id && !sitter_id) {
    return res.status(400).json({ message: 'user_id or sitter_id is required' });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  let error;

  if (user_id) {
    // Existing logic for linked sitters
    const response = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (response.error) {
        // If auth user delete fails (or doesn't exist), try cleaning up DB
        console.error('Auth delete error:', response.error);
    }
    // Also ensure DB cleanup if RPC not fully trusted or needed
    const { error: rpcError } = await supabaseAdmin.rpc('delete_sitter', { user_id });
    error = rpcError;
  } else if (sitter_id) {
    // Logic for unlinked sitter profile
    const { error: deleteError } = await supabaseAdmin
        .from('sitters')
        .delete()
        .eq('id', sitter_id);
    error = deleteError;
  }

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.status(200).json({ message: 'Sitter deleted successfully' });
}