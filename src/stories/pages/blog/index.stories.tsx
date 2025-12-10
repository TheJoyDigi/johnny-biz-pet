
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Blog from '@/pages/blog/index';
import { mockPosts } from '@/stories/mocks';

const meta: Meta<typeof Blog> = {
  title: 'Pages/Blog/List',
  component: Blog,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Blog>;

export const Default: Story = {
  args: {
    posts: mockPosts,
  },
};

export const Empty: Story = {
    args: {
      posts: [],
    },
};
