import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextApiRequest, type NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get: (name: string) => req.cookies[name],
                set: (name: string, value: string, options: CookieOptions) => {
                    // res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
                },
                remove: (name: string, options: CookieOptions) => {
                    // res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { data: userRecord } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!userRecord || userRecord.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { id, ...updateData } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Booking ID is required' });
    }

    const { data, error } = await supabase
        .from('booking_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ message: 'Error updating booking', error });
    }

    return res.status(200).json({ message: 'Booking updated successfully', data });
}
