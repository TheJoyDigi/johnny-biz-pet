
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import BookingCalendar from './BookingCalendar';

const meta: Meta<typeof BookingCalendar> = {
  title: 'Components/Sitter/BookingCalendar',
  component: BookingCalendar,
  parameters: {
      layout: 'padded'
  }
};

export default meta;
type Story = StoryObj<typeof BookingCalendar>;

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');

const mockBookings = [
    {
        id: "b1",
        start_date: `${year}-${month}-05`,
        end_date: `${year}-${month}-08`,
        customers: { name: "Doggy A" },
        status: "ACCEPTED"
    },
     {
        id: "b2",
        start_date: `${year}-${month}-15`,
        end_date: `${year}-${month}-15`,
        customers: { name: "Doggy B" },
         status: "ACCEPTED"
    },
     {
        id: "b3",
        start_date: `${year}-${month}-20`,
        end_date: `${year}-${month}-25`,
        customers: { name: "Doggy C" },
         status: "ACCEPTED"
    }

];

export const Default: Story = {
  args: {
    // @ts-ignore
    bookings: mockBookings
  },
};

export const Empty: Story = {
    args: {
      bookings: []
    },
  };
