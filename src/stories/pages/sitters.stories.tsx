
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SittersPage from '@/pages/sitters';
import { sitters as sittersData } from '@/data/sitters';

const meta: Meta<typeof SittersPage> = {
  title: 'Pages/Sitters/List',
  component: SittersPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SittersPage>;

export const Default: Story = {
  args: {
    // @ts-ignore
    sitters: sittersData,
  },
};

export const Empty: Story = {
    args: {
      sitters: [],
    },
};
