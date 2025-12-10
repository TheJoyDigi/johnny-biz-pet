
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Post from '@/pages/blog/[slug]';
import { mockPosts } from '@/stories/mocks';

const meta: Meta<typeof Post> = {
  title: 'Pages/Blog/Post',
  component: Post,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Post>;

export const Default: Story = {
  args: {
    post: mockPosts[0],
  },
};

export const NoCoverImage: Story = {
    args: {
      post: mockPosts[1],
    },
};
