
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import BookingNotes from './booking-notes';

const meta: Meta<typeof BookingNotes> = {
  title: 'Components/BookingNotes',
  component: BookingNotes,
  parameters: {
      layout: 'padded'
  }
};

export default meta;
type Story = StoryObj<typeof BookingNotes>;

const mockUser = {
    id: "user-1",
    email: "admin@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString()
};

const mockNotes = [
    {
        id: "note-1",
        note: "Customer requested early drop-off.",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        user: { first_name: "Admin", last_name: "User" }
    },
    {
        id: "note-2",
        note: "Confirmed availability with sitter.",
        created_at: new Date().toISOString(),
        user: { first_name: "System", last_name: "" }
    }
];

export const Default: Story = {
  args: {
    bookingId: "booking-123",
    // @ts-ignore
    notes: mockNotes,
    // @ts-ignore
    user: mockUser,
  },
};

export const Empty: Story = {
    args: {
      bookingId: "booking-123",
      notes: [],
      // @ts-ignore
      user: mockUser,
    },
  };
