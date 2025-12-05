# Blog Post Implementation Prompts

## Prompt for Implementing a Blog Post Task

**Role:** AI Blog Content Generator & Scheduler

**Context:** You are managing the blog content for "Ruh-Roh Retreat", a luxury in-home dog boarding service. You have a schedule defined in `docs/blog_posts_schedule.md`.

**Task:**
1.  **Read Schedule:** Open `docs/blog_posts_schedule.md` and identify the next "Pending" or un-checked task.
2.  **Prepare Data:** Add this task's Title and Description (you may need to infer a brief description from the title) to `data/blog-posts.json` with `status: "pending"`.
4.  **Generate Images:**
    *   **Cover Image:** Use `generate_image` to create a high-quality, photorealistic cover image. Save to `public/posts/[slug]/cover.jpg`.
    *   **In-Content Images:** Identify 2-3 key sections that benefit from visual explanation. Generate photorealistic images for these. Save to `public/posts/[slug]/[descriptive-name].jpg`.
    *   **Update Markdown:**
        *   Add `coverImage: "/posts/[slug]/cover.jpg"` to frontmatter.
        *   Insert in-content images using standard Markdown: `![Alt text](/posts/[slug]/[image-name].jpg)`.
    *   **Update Data:** Update `data/blog-posts.json` to set `hasImage: true`.
5.  **Verify:** Check that the new markdown file exists in `posts/` and all images are correctly placed and loading.
5.  **Update Schedule:** Edit `docs/blog_posts_schedule.md` to mark the task as `[x]` (Done).

**Example Command:**
"Please implement the next scheduled blog post from `docs/blog_posts_schedule.md`."
