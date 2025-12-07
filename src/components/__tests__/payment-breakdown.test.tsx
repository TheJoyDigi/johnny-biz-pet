
import { render, screen } from '@testing-library/react';
import PaymentBreakdown from '../payment-breakdown';
import { type BookingRequest, type Sitter } from '@/core/types';
import * as bookingUtils from '@/utils/booking';

// Mock the calculateBookingCost function
jest.mock('@/utils/booking', () => ({
  calculateBookingCost: jest.fn(),
}));

describe('PaymentBreakdown', () => {
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
    ],
    sitter_discounts: [],
  };

  it('should use calculateBookingCost for pending bookings', () => {
    const mockBooking: BookingRequest = {
      id: 'booking-1',
      status: 'PENDING_SITTER_ACCEPTANCE',
      start_date: '2025-10-20',
      booking_addons: [
        { sitter_addons: { id: 'addon-1', name: 'Walk', price_cents: 500 }, price_cents_at_booking: 500 },
      ],
    } as unknown as BookingRequest;

    (bookingUtils.calculateBookingCost as jest.Mock).mockReturnValue({
      baseRate: 10000,
      addOnsCost: 1000,
      discount: 100,
      totalCost: 10900,
    });

    render(<PaymentBreakdown booking={mockBooking} sitter={mockSitter} nights={2} />);

    expect(bookingUtils.calculateBookingCost).toHaveBeenCalledWith(mockBooking, mockSitter);
    // baseRate is 10000 ($100), nights is 2 -> 2 nights * $100 = $200
    expect(screen.getByText('2 nights × $100 = $200')).toBeInTheDocument(); 
    expect(screen.getByText('$10')).toBeInTheDocument(); // Add-ons
    expect(screen.getByText('-$1')).toBeInTheDocument(); // Discount
    expect(screen.getByText('$109')).toBeInTheDocument(); // Total
  });

  it('should use pre-calculated costs for accepted bookings', () => {
    const mockBooking: BookingRequest = {
      id: 'booking-2',
      status: 'ACCEPTED',
      start_date: '2025-10-20',
      end_date: '2025-10-22',
      base_rate_at_booking_cents: 12000,
      addons_total_cost_cents: 1500,
      discount_applied_cents: 200,
      total_cost_cents: 13300,
      booking_addons: [
        { sitter_addons: { id: 'addon-1', name: 'Walk', price_cents: 1500 }, price_cents_at_booking: 1500 },
      ],
    } as unknown as BookingRequest;

    render(<PaymentBreakdown booking={mockBooking} nights={2} />);

    // base_rate_at_booking_cents 12000 ($120) * 2 nights = $240
    expect(screen.getByText('2 nights × $120 = $240')).toBeInTheDocument();
    expect(screen.getByText(/Add-on: Walk/)).toBeInTheDocument();
    expect(screen.getByText('$15')).toBeInTheDocument(); // Add-ons
    expect(screen.getByText('-$2')).toBeInTheDocument(); // Discount
    expect(screen.getByText('$133')).toBeInTheDocument(); // Total
  });

  it('should render add-ons correctly', () => {
    const mockBooking: BookingRequest = {
      id: 'booking-3',
      status: 'ACCEPTED',
      start_date: '2025-10-20',
      end_date: '2025-10-22',
      base_rate_at_booking_cents: 10000,
      booking_addons: [
        {
          sitter_addons: { id: 'addon-1', name: 'Extra Walk', price_cents: 1200 },
          price_cents_at_booking: 1200,
        },
      ],
    } as unknown as BookingRequest;

    render(<PaymentBreakdown booking={mockBooking} nights={2} />);

    expect(screen.getByText(/Add-on: Extra Walk/)).toBeInTheDocument();
    expect(screen.getByText('$12')).toBeInTheDocument();
  });
});
