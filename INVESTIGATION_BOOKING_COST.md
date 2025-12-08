# Booking Cost Calculation Investigation

## Overview
This document details the investigation into how booking costs are calculated across the stack (Frontend, API, Database) and identifies a critical vulnerability where changing service rates after a booking request can unintentionally alter the final price charged to the customer.

## Current Workflow

### 1. Booking Request Creation (Frontend/Next.js API)
*   **Source**: `src/pages/api/booking.ts`
*   **Behavior**: When a user submits a booking:
    1.  The API looks up the *current* `price_cents` from `sitter_primary_services`.
    2.  It looks up correct `service_type_id`.
    3.  It inserts a row into `booking_requests` with:
        *   `base_rate_at_booking_cents`: Snapshotted correctly at creation time.
        *   `service_type_id`: Stored correctly.
        *   `status`: 'PENDING_SITTER_ACCEPTANCE'.

### 2. Sitter Acceptance (Database RPC)
*   **Source**: `supabase/migrations/20251206130000_update_booking_logic_and_schema.sql` -> function `accept_booking_request` and `calculate_booking_cost`.
*   **Behavior**:
    1.  Sitter clicks "Accept".
    2.  API calls `rpc('accept_booking_request')`.
    3.  **Step A (Addons)**: The function snapshots `booking_addons` prices into `price_cents_at_booking`. This part is **safe**.
    4.  **Step B (Recalculation)**: The function calls `calculate_booking_cost`.
    5.  **Step C (Update)**: The function updates `total_cost_cents`, `base_rate_at_booking_cents`, etc., with the results from Step B.

### 3. Cost Calculation Logic (The Vulnerability)
*   **Function**: `calculate_booking_cost`
*   **Logic**:
    ```sql
    -- Current Implementation (simplified)
    SELECT price_cents INTO sitter_base_rate_cents 
    FROM sitter_primary_services 
    WHERE sitter_id = ... AND service_type_id = ...;
    ```
*   **Issue**: This function **ignores** the `base_rate_at_booking_cents` that was already stored in the `booking_requests` table by the API. It *always* fetches the live rate from the sitter's profile.

## The Flaw: Rate Change Scenario

If a sitter changes their rates while a request is Pending, the following happens:

1.  **Customer** requests booking. Rate is **$50/night**.
    *   DB: `base_rate_at_booking_cents` = 5000.
2.  **Sitter** updates profile. Rate becomes **$100/night**.
    *   DB: `sitter_primary_services.price_cents` = 10000.
3.  **Sitter** accepts the booking.
    *   RPC calls `calculate_booking_cost`.
    *   Function query returns **$100/night**.
    *   Total is calculated at $100 rate.
    *   RPC updates `booking_requests` -> `base_rate_at_booking_cents` is overwritten to 10000.
    *   `total_cost_cents` reflects the higher price.
4.  **Result**: The customer is charged double what they saw at checkout.

## Recommended Fix

We must modify the `calculate_booking_cost` function (and potentially `accept_booking_request`) to respect the historical data if it exists.

### Database Migration Plan

1.  **Update `calculate_booking_cost` Function**:
    *   Prioritize reading `booking_requests.base_rate_at_booking_cents`.
    *   Only fetch from `sitter_primary_services` if the booking record is missing the snapshot (fallback/legacy support) or if explicitly forced to recalculate fresh.

    **Proposed SQL Logic:**

    ```sql
    CREATE OR REPLACE FUNCTION calculate_booking_cost(...)
    ...
    BEGIN
        -- 1. Try to get existing snapshot from booking itself
        SELECT base_rate_at_booking_cents INTO existing_snapshot_rate
        FROM booking_requests WHERE id = booking_id;

        IF existing_snapshot_rate IS NOT NULL AND existing_snapshot_rate > 0 THEN
            -- USE SNAPSHOT
            sitter_base_rate_cents := existing_snapshot_rate;
        ELSE
            -- FALLBACK: Fetch live rate
            SELECT price_cents INTO sitter_base_rate_cents 
            FROM sitter_primary_services ...
        END IF; 
        
        -- ... proceed with calculations ...
    END;
    ```

2.  **Review Discounts**:
    *   Currently, discounts (`sitter_discounts`) are also fetched live. If we want to guarantee immutable discounts, we should add a `discount_percentage_at_booking` column to `booking_requests` and snapshot it during the initial API call (`api/booking.ts`), similar to the base rate.
    *   *Recommendation*: For now, fixing the base rate is the highest priority. Discounts can be treated similarly in a future update.

## Action Items

1.  Create a migration file to update `calculate_booking_cost`.
2.  Run the migration to apply the fix to `rrr-dev` and `rrr-prod`.
3.  Verify the fix by simulating the "Rate Change" scenario.
