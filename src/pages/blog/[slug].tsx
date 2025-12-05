import { BlogPostMetaData } from "@/components/meta-data";
import type { Post } from "@/core/types";
import { getPostData, getSortedPostsData } from "@/lib/post";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import BlogLayout from "./_layout";
import { FaFacebook, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function Post({ post }: { post: Post }) {
  const imageUrl = post.hasCoverImage
    ? `/posts/${post.slug}/cover.jpg`
    : "https://www.ruhrohretreat.com/ruhrohretreat-social.jpg";

  return (
    <>
      <BlogPostMetaData
        title={post.title}
        description={post.description}
        date={post.date}
        author="Ruh-Roh Retreat"
        slug={post.slug}
        hasCoverImage={post.hasCoverImage}
      />
      <BlogLayout>
        <div className="blogContainer">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="relative w-full h-[400px] mb-8">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
          <ReactMarkdown>{post.content}</ReactMarkdown>

          {/* Social Share Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              Share this post
            </h3>
            <div className="flex gap-4">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  `https://www.ruhrohretreat.com/blog/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877F2] text-white p-3 rounded-full hover:scale-110 hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                aria-label="Share on Facebook"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  post.title
                )}&url=${encodeURIComponent(
                  `https://www.ruhrohretreat.com/blog/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#000000] text-white p-3 rounded-full hover:scale-110 hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                aria-label="Share on X (Twitter)"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                  `https://www.ruhrohretreat.com/blog/${post.slug}`
                )}&title=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0A66C2] text-white p-3 rounded-full hover:scale-110 hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                aria-label="Share on LinkedIn"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(
                  post.title
                )}&body=${encodeURIComponent(
                  `Check out this article from Ruh-Roh Retreat: https://www.ruhrohretreat.com/blog/${post.slug}`
                )}`}
                className="bg-gray-600 text-white p-3 rounded-full hover:scale-110 hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                aria-label="Share via Email"
              >
                <FaEnvelope size={24} />
              </a>
            </div>
          </div>
        </div>
      </BlogLayout>
    </>
  );
}

export async function getStaticProps({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const post = getPostData(slug);
  return {
    props: {
      post,
    },
  };
}

export async function getStaticPaths() {
  const posts = getSortedPostsData();
  const paths = posts.map((post) => {
    return {
      params: {
        slug: post.slug,
      },
    };
  });
  return {
    paths,
    fallback: false,
  };
}
