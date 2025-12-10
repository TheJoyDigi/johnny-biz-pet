
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PostCardCompoent } from './post-card';

const meta: Meta<typeof PostCardCompoent> = {
  title: 'Components/PostCard',
  component: PostCardCompoent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PostCardCompoent>;

const mockPost = {
  id: '1',
  slug: 'example-post',
  title: 'Example Blog Post',
  description: 'This is a description of the example blog post to demonstrate the card component.',
  date: '2023-10-27',
  content: 'Some content',
  author: 'Ruh-Roh Team',
  hasCoverImage: true,
  coverImage: 'https://placehold.co/600x400/png',
};

export const Default: Story = {
  args: {
    post: mockPost,
  },
};

export const NoImage: Story = {
  args: {
    post: {
      ...mockPost,
      hasCoverImage: false,
      coverImage: undefined,
    },
  },
};
