
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LandingComponent from './landing';

const meta: Meta<typeof LandingComponent> = {
  title: 'Pages/Landing',
  component: LandingComponent,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LandingComponent>;

export const Default: Story = {};
