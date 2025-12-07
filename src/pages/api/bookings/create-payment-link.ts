import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ message: 'Missing bookingId' });
  }

  try {
    // Fetch booking details
    const { data: booking, error } = await supabase
      .from("booking_requests")
      .select(
        "*, customers(*), booking_addons(*, sitter_addons(*))"
      )
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      throw new Error('Booking not found');
    }

    // Calculate duration in nights
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate amounts
    const baseRate = booking.base_rate_at_booking_cents || 0;
    const discount = booking.discount_applied_cents || 0;

    // Construct Line Items
    const line_items = [];

    // 1. Base Service
    if (baseRate > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Pet Sitting Service',
            description: `Booking from ${start.toLocaleDateString()} to ${end.toLocaleDateString()} (${nights} nights)`,
          },
          unit_amount: baseRate,
        },
        quantity: nights,
      });
    }

    // 2. Add-ons
    if (booking.booking_addons && booking.booking_addons.length > 0) {
        for (const addon of booking.booking_addons) {
             if (addon.price_cents_at_booking > 0) {
                 line_items.push({
                    price_data: {
                      currency: 'usd',
                      product_data: {
                        name: addon.sitter_addons?.name || 'Add-on',
                      },
                      unit_amount: addon.price_cents_at_booking,
                    },
                    quantity: 1,
                  });
             }
        }
    }

    // Handle Discounts via Coupon
    const discounts = [];
    if (discount > 0) {
       const coupon = await stripe.coupons.create({
         amount_off: discount,
         currency: 'usd',
         duration: 'once',
         name: 'Discount',
       });
       discounts.push({ coupon: coupon.id });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/cancel`,
        metadata: {
            bookingId: booking.id,
            customerId: booking.customer_id
        },
        discounts: discounts.length > 0 ? discounts : undefined,
        customer_email: booking.customers?.email,
    });

    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error('Error creating payment link:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}
