
import { calculateBookingCost } from '../booking';
import { type BookingRequest, type Sitter } from '@/core/types';

describe('calculateBookingCost', () => {
  const mockSitter: Sitter = {
    id: 'sitter-1',
    user: {
        id: 'user-1',
        email: 'sitter@test.com',
        first_name: 'Sitter',
        last_name: 'One',
    },
    sitter_primary_services: [
        {
            service_types: { slug: 'dog-boarding' },
            price_cents: 5000
        }
    ],
    sitter_addons: [
      { id: 'addon-1', name: 'Walk', price_cents: 1000 },
      { id: 'addon-2', name: 'Grooming', price_cents: 2500 },
    ],
    sitter_discounts: [
      { id: 'discount-1', min_days: 5, percentage: 10 },
      { id: 'discount-2', min_days: 10, percentage: 20 },
    ],
  };

  it('should calculate the cost for a basic booking', () => {
    const mockBooking: BookingRequest = {
      id: 'booking-1',
      start_date: '2025-10-20',
      end_date: '2025-10-22', // 2 nights
      booking_addons: [],
      // other properties can be null or undefined as they are not used in the calculation
    } as unknown as BookingRequest;

    const cost = calculateBookingCost(mockBooking, mockSitter);

    expect(cost.baseRate).toBe(5000); // Nightly rate
    expect(cost.addOnsCost).toBe(0);
    expect(cost.discount).toBe(0);
    expect(cost.totalCost).toBe(10000);
  });

  it('should calculate the cost with add-ons', () => {
    const mockBooking: BookingRequest = {
      id: 'booking-2',
      start_date: '2025-10-20',
      end_date: '2025-10-22', // 2 nights
      booking_addons: [
        { sitter_addons: { id: 'addon-1' } },
        { sitter_addons: { id: 'addon-2' } },
      ],
    } as unknown as BookingRequest;

    const cost = calculateBookingCost(mockBooking, mockSitter);

    expect(cost.baseRate).toBe(5000); // Nightly rate
    expect(cost.addOnsCost).toBe(3500); // 1000 + 2500
    expect(cost.discount).toBe(0);
    expect(cost.totalCost).toBe(13500);
  });

  it('should apply the correct discount for a longer stay', () => {
    const mockBooking: BookingRequest = {
      id: 'booking-3',
      start_date: '2025-10-20',
      end_date: '2025-10-26', // 6 nights
      booking_addons: [],
    } as unknown as BookingRequest;

    const cost = calculateBookingCost(mockBooking, mockSitter);

    expect(cost.baseRate).toBe(5000); // Nightly rate
    expect(cost.addOnsCost).toBe(0);
    expect(cost.discount).toBe(3000); // 10% of 30000
    expect(cost.totalCost).toBe(27000);
  });

  it('should calculate the cost with both add-ons and a discount', () => {
    const mockBooking: BookingRequest = {
      id: 'booking-4',
      start_date: '2025-10-20',
      end_date: '2025-10-31', // 11 nights
      booking_addons: [
        { sitter_addons: { id: 'addon-1' } },
      ],
    } as unknown as BookingRequest;

    const cost = calculateBookingCost(mockBooking, mockSitter);

    expect(cost.baseRate).toBe(5000); // Nightly rate
    expect(cost.addOnsCost).toBe(1000);
    expect(cost.discount).toBe(11000); // 20% of 55000
    expect(cost.totalCost).toBe(45000);
  });
});
