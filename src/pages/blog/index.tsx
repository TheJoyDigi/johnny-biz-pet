import { Post } from "@/core/types";
import { getSortedPostsData } from "@/lib/post";
import BlogLayout from "./_layout";
import Link from "next/link";
import Image from "next/image";

export default function Blog({ posts }: { posts: any }) {
  return (
    <BlogLayout>
      <BlogPosts posts={posts} />
    </BlogLayout>
  );
}

const BlogPosts = ({ posts }: { posts: Post[] }) => {
  const heroPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Post */}
      {heroPost && (
        <div className="mb-16 group cursor-pointer">
           <Link href={`/blog/${heroPost.slug}`} className="block">
            <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-xl mb-6">
              <Image
                src={
                  heroPost.hasCoverImage
                    ? `/posts/${heroPost.slug}/cover.jpg`
                    : `/about-image.jpeg`
                }
                alt={heroPost.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-4xl">
                <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-white uppercase bg-[#F28C38] rounded-full">
                  Featured
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-[#F28C38] transition-colors">
                  {heroPost.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-200 line-clamp-2 mb-4">
                  {heroPost.description}
                </p>
                <div className="flex items-center text-gray-300 text-sm font-medium">
                  <span>{heroPost.date}</span>
                  <span className="mx-2">•</span>
                  <span>Ruh-Roh Retreat</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Grid of Other Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {otherPosts.map((post) => (
          <div key={post.id} className="flex flex-col h-full group">
             <Link href={`/blog/${post.slug}`} className="block h-full">
              <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-md mb-5">
                <Image
                  src={
                    post.hasCoverImage
                      ? `/posts/${post.slug}/cover.jpg`
                      : `/about-image.jpeg`
                  }
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="flex flex-col flex-grow">
                <div className="flex items-center text-sm text-gray-500 mb-3 space-x-2">
                  <span className="text-[#1A9CB0] font-semibold">Article</span>
                  <span>•</span>
                  <span>{post.date}</span>
                </div>
                <h2 className="text-xl font-bold text-[#333333] mb-3 leading-snug group-hover:text-[#1A9CB0] transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 line-clamp-3 leading-relaxed flex-grow">
                  {post.description}
                </p>
                <div className="mt-4 flex items-center text-[#F28C38] font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  Read Article →
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
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
