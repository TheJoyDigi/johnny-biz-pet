# Meet Our Sitters – Implementation Plan

## Goals
- Transition Ruh-Roh Retreat from a single-sitter story to a platform showcasing multiple verified sitters.
- Centralize sitter bios, homes, badges, reviews, and locations in structured data for reuse across pages.
- Add a dedicated "Meet Our Sitters" page while keeping the landing page updated with Johnny’s profile.

## Data Model
- Create `data/sitters.json` exporting an array of sitter records keyed by `id` (e.g., `johnny-irvine`).
- Each sitter object will include:
  - `name`, `tagline`, `avatar`, `heroImage`.
  - `locations`: array with `city`, `state`, `postalCode`, `lat`, `lng`, `serviceRadiusMiles`.
  - `bio`: array of paragraphs (Johnny’s current About text, plus Trudy’s new content).
  - `homeEnvironment`: bullet-ready list describing yard, household, routines, safety checks.
  - `badges`: Ruh-Roh badge keys + copy for the sitter.
  - `services`: `primary` list plus optional `addOns` to align with existing sections.
  - `reviews`: map existing highlighted/general testimonials to Johnny; create mock ones for Trudy (client name, pet name, rating, quote, date).
  - `availabilityNotes` and `contactEmail` for future automation.

## Work Breakdown
1. **Data Seeding**
   - Build `sitters.json` with Johnny populated using About + Testimonials copy, and add Trudy (Wildomar, CA 92595) with mock but believable information.
2. **Landing Page Updates**
   - Refactor `AboutSection` to read Johnny’s `bio` from the JSON (either via direct import or utility hook).
   - Update `TestimonialsSection` to consume Johnny’s `reviews`, keeping existing fetch fallback until new page is live.
3. **Meet Our Sitters Page**
   - Add `src/pages/sitters.tsx` that loads all sitters statically and renders cards with bios, badges, home environment, and reviews.
   - Compose new UI primitives in `src/components/sitters/` (e.g., `SitterCard`, `BadgeList`, `ReviewList`).
4. **Navigation & Booking Hooks**
   - Add “Meet Our Sitters” CTA to header/footer nav.
   - Ensure booking components can reference sitter data (location dropdown uses `locations`).
5. **Testing & Validation**
   - Add unit tests for new components (render data, ensure fallback copy) and adjust existing snapshots/tests.

## Considerations
- Keep JSON extendable for future sitters (IDs should be slug-friendly).
- Ensure new fetch/import path works both in Next.js server and client components.
- Watch bundle size—lazy-load heavy reviewer data if needed once more sitters are added.
