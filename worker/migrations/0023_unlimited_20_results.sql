-- Compatibility correction for environments that have not yet applied 0023.
-- The authoritative current contract is restored by 0024.
UPDATE plans
SET monthly_quota=0,
    rate_limit_per_minute=10,
    max_results=20
WHERE tier='free';
UPDATE customers
SET monthly_quota=0,
    rate_limit_per_minute=10
WHERE tier='free';
