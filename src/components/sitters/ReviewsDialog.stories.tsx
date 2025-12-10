
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ReviewsDialog from './ReviewsDialog';

const meta: Meta<typeof ReviewsDialog> = {
  title: 'Sitters/ReviewsDialog',
  component: ReviewsDialog,
  parameters: {
      layout: 'centered' // Dialog usually overlays content, so centered is good
  }
};

export default meta;
type Story = StoryObj<typeof ReviewsDialog>;

const mockReviews = [
    {
        id: "1",
        client: "Sarah J.",
        pet: "Max (Golden Retriever)",
        date: "Oct 2023",
        rating: 5,
        text: "Johnny was absolutely amazing with Max! He sent regular updates and pictures, and Max looked so happy. His home is perfect for dogs, really clean and calm. We will definitely be booking again."
    },
    {
        id: "2",
        client: "Mike T.",
        pet: "Charlie",
        date: "Sep 2023",
        rating: 5,
        text: "Trudy is the best! She took such good care of our anxious little terrier. She was patient and kind, and her backyard is a dog's paradise."
    },
    {
        id: "3",
        client: "Emily R.",
        pet: "Bella",
        date: "Aug 2023",
        rating: 4,
        text: "Great experience overall. Good communication and care."
    }
];

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close dialog'),
    reviews: mockReviews,
  },
};

export const ManyReviews: Story = {
    args: {
      isOpen: true,
      onClose: () => console.log('Close dialog'),
      reviews: [
          ...mockReviews,
          ...mockReviews.map((r, i) => ({...r, id: `copy-${i}`, client: `${r.client} (${i})`})),
          ...mockReviews.map((r, i) => ({...r, id: `copy-2-${i}`, client: `${r.client} (${i+10})`})),
      ],
    },
  };
