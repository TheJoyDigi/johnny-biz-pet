
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import PaymentBreakdown from './payment-breakdown';

const meta: Meta<typeof PaymentBreakdown> = {
  title: 'Components/PaymentBreakdown',
  component: PaymentBreakdown,
  parameters: {
      layout: 'padded'
  }
};

export default meta;
type Story = StoryObj<typeof PaymentBreakdown>;

const mockBooking = {
    id: "booking-1",
    status: "ACCEPTED",
    start_date: "2023-11-01",
    end_date: "2023-11-05",
    base_rate_at_booking_cents: 5000,
    addons_total_cost_cents: 3000,
    discount_applied_cents: 1000,
    total_cost_cents: 22000,
    booking_addons: [
        {
            sitter_addons: { id: "a1", name: "Bath" },
            price_cents_at_booking: 3000
        }
    ]
};

export const Default: Story = {
  args: {
    // @ts-ignore
    booking: mockBooking,
    nights: 4,
  },
};
