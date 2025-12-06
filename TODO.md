# Database & Geolocation Improvements

- [ ] **Enable PostGIS:** Verify PostGIS extension is enabled in Supabase to support efficient geospatial queries.
- [ ] **Add Geography Column:** Create a migration to add a `location` column (type `GEOGRAPHY(POINT, 4326)`) to the `sitters` table.
  - [ ] Create a trigger or update logic to automatically populate `location` from `lat`/`lng` columns to ensure consistency.
- [ ] **Create Search Function:** Implement a Supabase RPC function (e.g., `search_sitters_nearby`) to allow querying sitters within a radius, sorted by distance.
- [ ] **Update Sitter API:** Update `src/pages/api/admin/update-sitter.ts` to ensure the `location` column is updated when the admin saves a profile.
- [ ] **Frontend Search:**
  - [ ] Implement a "Find a Sitter" search input on the public Sitters page.
  - [ ] Integrate with Google Places Autocomplete (or similar) to get user coordinates.
  - [ ] Connect the search input to the `search_sitters_nearby` RPC to filter results.
