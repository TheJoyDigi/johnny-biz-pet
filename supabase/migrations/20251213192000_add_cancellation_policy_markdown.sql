ALTER TABLE sitters ADD COLUMN IF NOT EXISTS cancellation_policy_markdown TEXT;

UPDATE sitters
SET cancellation_policy_markdown = E'## Cancellation Policy\n- **7+ days:** Free cancellation\n- **3-7 days:** 50% fee\n- **<3 days:** Full fee\n\n## Extended Care / Late Pickup\n- **Up to 1 hour late:** No charge (grace period for traffic, etc.)\n- **1-4 hours late:** $25 late pickup fee\n- **More than 4 hours late:** Full additional day rate ($50)';
