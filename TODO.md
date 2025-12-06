# Phase 2: Sitter Image Migration & Optimization

## 1. Image Migration to Supabase Storage
- [x] **Create Supabase Storage Bucket**: Ensure a dedicated public bucket exists for sitter images (e.g., `sitter-images`).
- [x] **Develop Migration Script (`scripts/migrate_sitter_images.js`)**:
  - Iterate through local sitter image directories (e.g., `public/sitters/sr-001/avatar.jpg`, `public/sitters/sr-001/hero.jpg`, `public/sitters/sr-001/gallery/*`, and `public/sitters/sr-002/...`).
  - For each image:
    - Upload to the Supabase Storage bucket, maintaining a logical path structure (e.g., `sitters/sr-001/avatar.jpg`).
    - Store the public URL of the uploaded image.
- [x] **Update Sitter Records in Database**:
  - Update `avatar_url`, `hero_image_url` fields in the `public.sitters` table with the new Supabase Storage URLs.
  - If a gallery table exists or is created, update image URLs there. (Currently, gallery images are read directly from `public` folder and constructed on the fly in `sitters/[id].tsx`, so this might require a change to store gallery image URLs in DB).
- [ ] **Update Reviews Images**: If `sitter_reviews.image_url` is used, ensure it points to Supabase Storage URLs after migration. (Currently no review images, so not critical).

## 2. Frontend Integration for Supabase Images
- [x] **Update `src/lib/sitters-db.ts`**: Ensure the `fetchSittersFromDb` function correctly retrieves and provides the new Supabase Storage image URLs.
- [x] **Review Components**: Verify that image components (e.g., `Image` in Next.js) correctly use the new URLs.

## 3. Image Optimization for Performance
- [x] **Pre-upload Optimization**:
  - Consider adding a step in the migration script to optimize images (resize, compress) before uploading them to Supabase Storage.
  - Investigate using Next.js Image component's built-in optimization with Supabase image loader.
- [ ] **Supabase Image Transformations**: Explore using Supabase's image transformation capabilities (if available) for on-the-fly optimization.
- [x] **Cleanup**: Remove local image files from the `public/sitters` directory after successful migration and verification.