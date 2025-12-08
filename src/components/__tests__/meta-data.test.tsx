import { render } from '@testing-library/react';
import { DefaultMetaData, BlogPostMetaData } from '../meta-data';
import Head from 'next/head';

// Mocking next/head
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: Array<React.ReactElement> }) => {
      // This is a simplified mock. In a real app, you might want a more robust one.
      // For testing, we can just render the children, which will be meta, title, etc.
      // In our tests, we will check `document.head` for the results.
      return <>{children}</>;
    },
  };
});


describe('DefaultMetaData', () => {
  it('renders the default title and description', () => {
    render(<DefaultMetaData />, { container: document.head });

    expect(document.title).toBe('Ruh-Roh Retreat | Boutique In-Home Dog Sitting in Irvine & Wildomar');
    const description = document.querySelector('meta[name="description"]');
    expect(description).toHaveAttribute(
      'content',
      'Boutique in-home dog sitting powered by Badge-Rated sitters who deliver calm, structured care, daily updates, and vacation-style add-ons throughout Irvine and Wildomar.'
    );
  });
});

describe('BlogPostMetaData', () => {
  const mockPost = {
    title: 'Test Post',
    description: 'This is a test post.',
    date: '2025-10-07T12:00:00Z',
    author: 'Test Author',
    slug: 'test-post',
    hasCoverImage: true,
  };

  it('renders the correct title for a blog post', () => {
    render(<BlogPostMetaData {...mockPost} />, { container: document.head });
    expect(document.title).toBe('Test Post - Ruh-Roh Retreat Blog');
  });

  it('renders the correct description for a blog post', () => {
    render(<BlogPostMetaData {...mockPost} />, { container: document.head });
    const description = document.querySelector('meta[name="description"]');
    expect(description).toHaveAttribute('content', 'This is a test post.');
  });

  it('renders the correct author for a blog post', () => {
    render(<BlogPostMetaData {...mockPost} />, { container: document.head });
    const author = document.querySelector('meta[name="author"]');
    expect(author).toHaveAttribute('content', 'Test Author');
  });

  it('renders the correct image URL when hasCoverImage is true', () => {
    render(<BlogPostMetaData {...mockPost} hasCoverImage={true} />, { container: document.head });
    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage).toHaveAttribute('content', 'https://www.ruhrohretreat.com/posts/test-post/cover.jpg');
  });

  it('renders the default image URL when hasCoverImage is false', () => {
    render(<BlogPostMetaData {...mockPost} hasCoverImage={false} />, { container: document.head });
    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage).toHaveAttribute('content', 'https://www.ruhrohretreat.com/hero/landing-hero.png');
  });
});
