import Head from "next/head";
import { PostCardCompoent } from "@/components/post-card";
import { SITE_URL, SOCIAL_IMAGE_URL } from "@/components/meta-data";
import { Post } from "@/core/types";
import { getSortedPostsData } from "@/lib/post";
import BlogLayout from "./_layout";

export default function Blog({ posts }: { posts: Post[] }) {
  const canonicalUrl = `${SITE_URL}/blog`;

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Ruh-Roh Retreat Blog",
    description: "Pet care guides, sitter updates, and behind-the-scenes stories from Ruh-Roh Retreat.",
    url: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: "Ruh-Roh Retreat",
      url: SITE_URL,
    },
    blogPost: posts.map((post: Post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.date,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <Head>
        <title>Ruh-Roh Retreat Blog | Pet Boarding Tips & Sitter Stories</title>
        <meta
          name="description"
          content="Read the latest pet boarding guidance, sitter announcements, and service updates from Ruh-Roh Retreat."
        />
        <meta
          name="keywords"
          content="pet boarding tips, sitter updates, Ruh-Roh Retreat blog, dog boarding advice, cat boarding advice"
        />
        <meta property="og:title" content="Ruh-Roh Retreat Blog | Pet Boarding Tips & Sitter Stories" />
        <meta
          property="og:description"
          content="Read the latest pet boarding guidance, sitter announcements, and service updates from Ruh-Roh Retreat."
        />
        <meta property="og:image" content={SOCIAL_IMAGE_URL} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Ruh-Roh Retreat" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ruh-Roh Retreat Blog | Pet Boarding Tips & Sitter Stories" />
        <meta
          name="twitter:description"
          content="Read the latest pet boarding guidance, sitter announcements, and service updates from Ruh-Roh Retreat."
        />
        <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>
      <BlogLayout>
        <BlogPosts posts={posts} />
      </BlogLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogSchema),
        }}
      />
    </>
  );
}

const BlogPosts = ({ posts }: { posts: Post[] }) => {
  return (
    <div className="blogContainer">
      {posts.map((post) => (
        <div key={post.id} className="mt-5">
          <PostCardCompoent post={post}></PostCardCompoent>
        </div>
      ))}
    </div>
  );
};

export async function getStaticProps() {
  const posts = getSortedPostsData();
  return {
    props: {
      posts,
    },
  };
}
