# Phase 3: Admin & Sitter Profile Management

## Admin Sitter Profile Management Page
- [x] **Page Setup**
  - Create a new page: `src/pages/admin/sitters/[id]/edit.tsx` (or similar route).
  - Implement role-based access control (Admin or the Sitter themselves).
- [x] **UI/UX Design**
  - Design a comprehensive form using a tabbed or stepper layout to handle dense data:
    - **Basic Info**: Name, Tagline, Bio, Avatar, Hero Image.
    - **Location**: Address, Service Radius, Google Maps integration for Lat/Lng.
    - **Services & Rates**: Base rates, Primary Services editor.
    - **Add-ons**: List editor for add-ons (name, price, description).
    - **Discounts**: Discount rules editor.
    - **Policies**: Cancellation & Extended Care policies.
    - **Gallery**: Image uploader for the gallery (drag & drop, preview, delete).
    - **Badges**: Admin-only toggle for assigning badges.
- [x] **Functionality**
  - **Data Fetching**: Load existing sitter data from Supabase.
  - **Image Upload**: Integrate with Supabase Storage for Avatar, Hero, and Gallery images. Implement image resizing/optimization on upload if possible.
  - **Form Handling**: Use `react-hook-form` and `zod` for validation.
  - **Persistence**: Implement save/update logic to `public.sitters`, `public.sitter_addons`, and `public.sitter_discounts`.
- [x] **Validation & Error Handling**
  - Add success/error toasts notifications.
  - Ensure data integrity (e.g., preventing deletion of active services with bookings).