
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SitterDetail from './SitterDetail';
import { sitters } from '@/data/sitters';

const meta: Meta<typeof SitterDetail> = {
  title: 'Sitters/SitterDetail',
  component: SitterDetail,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SitterDetail>;

export const Johnny: Story = {
  args: {
    // @ts-ignore
    sitter: sitters[0],
  },
};

export const Trudy: Story = {
    args: {
      // @ts-ignore
      sitter: sitters[1],
    },
  };
