
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SitterGallery from './SitterGallery';

const meta: Meta<typeof SitterGallery> = {
  title: 'Sitters/SitterGallery',
  component: SitterGallery,
  parameters: {
      layout: 'padded'
  }
};

export default meta;
type Story = StoryObj<typeof SitterGallery>;

const mockPhotos = Array.from({ length: 8 }).map((_, i) => ({
    id: `photo-${i}`,
    src: `https://picsum.photos/seed/${i + 1}/800/600`,
    alt: `Gallery Photo ${i + 1}`,
}));

export const Default: Story = {
  args: {
    photos: mockPhotos,
    title: 'Photo Gallery',
  },
};

export const FewPhotos: Story = {
    args: {
      photos: mockPhotos.slice(0, 3),
      title: 'Small Gallery',
    },
  };
