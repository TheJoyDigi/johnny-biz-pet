
import { type BookingRequest, type Sitter } from '@/core/types';
import { calculateBookingCost } from '@/utils/booking';
import { Calendar } from 'lucide-react';

interface PaymentBreakdownProps {
  booking: BookingRequest;
  sitter?: Sitter;
  nights: number;
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center text-gray-700">
    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
    <span className="font-medium">{label}:</span>
    <span className="ml-2">{value}</span>
  </div>
);

export default function PaymentBreakdown({ booking, sitter, nights }: PaymentBreakdownProps) {
  let cost: {
    baseRate: number;
    addOnsCost: number;
    discount: number;
    totalCost: number;
  };

  if (booking.status === 'PENDING_SITTER_ACCEPTANCE' && sitter) {
    cost = calculateBookingCost(booking, sitter);
  } else {
    cost = {
      baseRate: booking.base_rate_at_booking_cents || 0,
      addOnsCost: booking.addons_total_cost_cents || 0,
      discount: booking.discount_applied_cents || 0,
      totalCost: booking.total_cost_cents || 0,
    };
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
        Payment
      </h2>
      <div className="space-y-3">
        <InfoRow
          label="Base Rate"
          value={
            cost.baseRate
              ? `${nights} nights × $${cost.baseRate / 100} = $${(cost.baseRate * nights) / 100}`
              : 'N/A'
          }
        />
        {booking.booking_addons?.map((addon) => {
          let price;
          if (booking.status === 'PENDING_SITTER_ACCEPTANCE' && sitter) {
            const sitterAddon = sitter.sitter_addons?.find(sa => sa.id === addon.sitter_addons.id);
            price = sitterAddon?.price_cents;
          } else {
            price = addon.price_cents_at_booking;
          }

          return (
            <InfoRow
              key={addon.sitter_addons.id}
              label={`Add-on: ${addon.sitter_addons.name}`}
              value={`$${price ? price / 100 : 'N/A'}`}
            />
          );
        })}
        <InfoRow
          label="Discount"
          value={`-$${cost.discount / 100}`}
        />
        <InfoRow
          label="Total Cost"
          value={`$${cost.totalCost ? cost.totalCost / 100 : 'N/A'}`}
        />
      </div>
    </div>
  );
}
