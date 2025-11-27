# SEO Implementation Guide

## Core metadata
- **Default metadata** lives in [`src/components/meta-data.tsx`](../src/components/meta-data.tsx) and is injected globally from `_app.tsx`.
- The default title/description highlight boutique, in-home boarding across Irvine and Wildomar and power Open Graph/Twitter previews.
- Shared constants expose the canonical site URL (`SITE_URL`), social share image (`SOCIAL_IMAGE_URL`), and the `LOCAL_BUSINESS_SCHEMA` object so pages can stay consistent.
- The shared `LOCAL_BUSINESS_SCHEMA` captures both service areas, price range, hours, contact number, social profiles, and featured offers (overnight boarding, spa baths, special care, and premium play sessions).

## Page-level SEO
- **Landing page** reuses `LOCAL_BUSINESS_SCHEMA` to keep structured data synchronized with the default metadata.
- **Sitters listing** (`src/pages/sitters.tsx`)
  - Custom Head block with localized title/description/keywords, OG + Twitter cards, and a canonical tag for `/sitters`.
  - Emits a `CollectionPage`/`ItemList` JSON-LD payload enumerating each sitter profile URL and tagline for richer sitelinks.
- **Sitter profiles** (`src/pages/sitters/[id].tsx`)
  - Page-specific title, description, keywords, OG/Twitter previews, and canonical pointing to each profile.
  - JSON-LD `Person` schema describing the sitter, service areas, offered services, and aggregate rating when reviews exist.
- **Blog listing** (`src/pages/blog/index.tsx`)
  - Dedicated Head block with canonical URL, OG/Twitter metadata, and an accompanying `Blog` JSON-LD node with links to each post.
- **Blog posts** use `BlogPostMetaData` for per-article metadata, canonical URLs, and `BlogPosting` JSON-LD entries.

## Crawling & sitemaps
- `next-sitemap.config.js` drives sitemap generation with `generateRobotsTxt` enabled and root priority set to `1.0`.
- Run `npm run postbuild` (or `next-sitemap`) after adding or renaming routes so the sitemap and robots.txt reflect new pages.

## Adding new pages
- Import `Head` and the SEO helpers from `src/components/meta-data.tsx` to keep URLs, images, and keywords aligned.
- Always add a canonical link, descriptive OG/Twitter metadata, and (when applicable) JSON-LD describing the page (e.g., `Article`, `FAQPage`, `ItemList`).
- Align copy in titles/descriptions with the latest service areas (Irvine & Wildomar) and premium boarding offers to preserve relevance.
