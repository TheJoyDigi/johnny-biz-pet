
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SitterSearch from './SitterSearch';

const meta: Meta<typeof SitterSearch> = {
  title: 'Sitters/SitterSearch',
  component: SitterSearch,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SitterSearch>;

export const Default: Story = {
  args: {
    isLoading: false,
    onSearch: (lat, lng) => console.log('Search:', lat, lng),
  },
};

export const Loading: Story = {
    args: {
      isLoading: true,
      onSearch: (lat, lng) => console.log('Search:', lat, lng),
    },
};
