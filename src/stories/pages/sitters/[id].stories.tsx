
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SitterPage from '@/pages/sitters/[id]';
import { sitters as sittersData } from '@/data/sitters';

const meta: Meta<typeof SitterPage> = {
  title: 'Pages/Sitters/Profile',
  component: SitterPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SitterPage>;

export const Johnny: Story = {
  args: {
    // @ts-ignore
    sitter: sittersData[0],
  },
};

export const Trudy: Story = {
  args: {
    // @ts-ignore
    sitter: sittersData[1],
  },
};
