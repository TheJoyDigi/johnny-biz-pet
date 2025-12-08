import { type BookingRequest, type Sitter } from '@/core/types';

export function calculateBookingCost(booking: BookingRequest, sitter: Sitter) {
  const nights = (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24);
  
  // Determine service rate
  let targetService;
  
  if (booking.sitter_service_id && sitter.sitter_primary_services) {
    targetService = sitter.sitter_primary_services.find(s => s.id === booking.sitter_service_id);
  }

  // Fallback to legacy behavior if not found (or if not provided)
  if (!targetService && sitter.sitter_primary_services) {
     targetService = sitter.sitter_primary_services.find(s => s.service_types.slug === 'dog-boarding');
  }

  const baseRateCents = targetService ? targetService.price_cents : 0;
  
  const totalBaseCost = baseRateCents * nights;

  const addOnsCost = booking.booking_addons?.reduce((total, addon) => {
    const sitterAddon = sitter.sitter_addons?.find(sa => sa.id === addon.sitter_addons.id);
    return total + (sitterAddon?.price_cents || 0);
  }, 0) || 0;

  const applicableDiscount = sitter.sitter_discounts?.reduce((bestDiscount: { id: string; min_days: number; percentage: number; } | null, currentDiscount) => {
    if (nights >= currentDiscount.min_days && (!bestDiscount || currentDiscount.min_days > bestDiscount.min_days)) {
      return currentDiscount;
    }
    return bestDiscount;
  }, null);

  const discountPercentage = applicableDiscount ? applicableDiscount.percentage : 0;
  const discount = (totalBaseCost * discountPercentage) / 100;

  const totalCost = totalBaseCost + addOnsCost - discount;

  return {
    baseRate: baseRateCents,
    addOnsCost,
    discount,
    totalCost,
  };
}
