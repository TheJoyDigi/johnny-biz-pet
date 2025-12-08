import { createServerClient } from '@supabase/ssr';
import { type NextApiRequest, type NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { get: (name) => req.cookies[name] } }
    );

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { bookingId } = req.body;
        if (!bookingId) throw new Error('Booking ID is required');

        // Check ownership (sitter is assigned)
        const { data: sitter } = await supabase.from('sitters').select('id').eq('user_id', user.id).single();
        if (!sitter) throw new Error('Sitter not found');

        // Fetch booking to get total cost
        const { data: booking, error: fetchError } = await supabase
            .from('booking_requests')
            .select('total_cost_cents')
            .eq('id', bookingId)
            .single();
            
        if (fetchError || !booking) throw new Error('Booking not found');

        // Update booking
        const { error } = await supabase
            .from('booking_requests')
            .update({ 
                payment_status: 'PAID',
                paid_at: new Date().toISOString(),
                amount_paid_cents: booking.total_cost_cents,
                payment_method: 'OFFLINE/MANUAL' // Tracking manual book
            })
            .eq('id', bookingId)
            .eq('assigned_sitter_id', sitter.id)
            .eq('status', 'ACCEPTED');

        if (error) throw error;

        res.status(200).json({ message: 'Booking finalized successfully!' });

    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
}
