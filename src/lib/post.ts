import type { Post } from "@/core/types";
import fs from "fs";
import matter from "gray-matter";
import path from "path";

const postsDirectory = path.join(process.cwd(), "posts");
const publicPostsDirectory = path.join(process.cwd(), "public/posts");

export function getSortedPostsData(): Post[] {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const slug = fileName.replace(/\.md$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Check for cover image
    const coverImagePath = path.join(publicPostsDirectory, slug, "cover.jpg");
    const hasCoverImage = fs.existsSync(coverImagePath);

    // Combine the data with the id and cover image info
    return {
      slug,
      ...matterResult.data,
      hasCoverImage,
      coverImage: matterResult.data.coverImage,
    } as Post;
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostData(slug: string): Post {
  // Read markdown file as string
  const fileName = `${slug}.md`;
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const { data, content } = matter(fileContents);

  // Check for cover image
  const coverImagePath = path.join(publicPostsDirectory, slug, "cover.jpg");
  const hasCoverImage = fs.existsSync(coverImagePath);

  // Combine the data with the id and slug
  return {
    ...data,
    content,
    hasCoverImage,
    slug,
    coverImage: data.coverImage,
  } as Post;
}
