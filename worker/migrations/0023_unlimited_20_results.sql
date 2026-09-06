-- Production free plan contract.
-- 100 requests per month, 10 requests per minute, up to 10 repositories per scan.

UPDATE plans
SET monthly_quota=100,
    rate_limit_per_minute=10,
    max_results=10
WHERE tier='free';

UPDATE customers
SET monthly_quota=100,
    rate_limit_per_minute=10
WHERE tier='free';
