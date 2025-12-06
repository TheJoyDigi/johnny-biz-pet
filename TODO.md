# Phase 3: Admin & Sitter Profile Management Enhancements

## 1. Sitter Schema & Data Structure
- [ ] **Schema Update**:
  - Add `care_style` (jsonb) and `parent_expectations` (jsonb) columns to `public.sitters` table.
  - Migrate existing data from `bio` text fields to these new columns where applicable.
- [ ] **Sitter Form Update**:
  - Add dedicated array inputs for "My Care Style" and "What Pet Parents Can Expect" in the `SitterForm` component (similar to Skills/Home Environment).

## 2. Admin Invite Sitter Flow
- [ ] **Update Invite Page**:
  - Modify `src/pages/admin/sitters/new.tsx` (or create it).
  - Add toggle/option: "Send Invitation Email Now" vs "Create Profile Only" (link user later).
  - Implement logic to create `users` and `sitters` records without triggering auth email if requested.

## 3. Profile Preview
- [ ] **Preview Feature**:
  - Add "Preview Profile" button to `EditSitterPage`.
  - Link to `/sitters/[slug]` or open a modal rendering `SitterDetail` with current form data (live preview).

## 4. Admin UI/UX Overhaul
- [ ] **Dashboard Layout**:
  - Refactor `AdminLayout` to use a modern sidebar navigation, responsive header, and clean typography (Tailwind).
  - Ensure mobile-first responsiveness for table views (cards on mobile).
- [ ] **Page Styling**:
  - Polish `sitters.tsx` (list), `bookings/index.tsx` (if exists), and other admin pages to match the new design system.