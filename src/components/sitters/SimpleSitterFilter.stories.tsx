
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SimpleSitterFilter from './SimpleSitterFilter';

const meta: Meta<typeof SimpleSitterFilter> = {
  title: 'Sitters/SimpleSitterFilter',
  component: SimpleSitterFilter,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SimpleSitterFilter>;

const locations = ['Irvine', 'Wildomar', 'Newport Beach', 'Lake Forest'];

export const Default: Story = {
  args: {
    locations,
    selectedLocation: null,
    onSelect: (loc) => console.log('Selected:', loc),
  },
};

export const Selected: Story = {
    args: {
      locations,
      selectedLocation: 'Irvine',
      onSelect: (loc) => console.log('Selected:', loc),
    },
  };
