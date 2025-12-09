import { Post } from "@/core/types";
import Image from "next/image";
import Link from "next/link";

export const PostCardCompoent = ({ post }: { post: Post }) => {
  return (
    <>
      <div className="max-w-sm w-full lg:max-w-full lg:flex shadow-md">
        <div className="lg:h-auto lg:w-[50%] flex-none relative">
          <Image
            src={
              post.coverImage
                ? post.coverImage
                : post.hasCoverImage
                ? `/posts/${post.slug}/cover.jpg`
                : `/about-image.jpeg`
            }
            alt={post.title}
            fill
            className="object-cover rounded-t lg:rounded-t-none lg:rounded-l"
          />
        </div>
        <div className="bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
          <div>
            <div className="text-gray-900 font-bold text-xl mb-2">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </div>
            <p className="text-gray-700 text-base">{post.description}</p>
          </div>
          <div className="flex items-center">
            <div className="text-sm">
              <p className="text-gray-900 leading-none">{post.author}</p>
              <p className="text-gray-600">{post.date}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
