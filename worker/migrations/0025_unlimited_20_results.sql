-- Authoritative public product contract: unlimited monthly usage,
-- 10 requests per minute, up to 20 repositories per scan.

UPDATE plans
SET monthly_quota=0,
    rate_limit_per_minute=10,
    max_results=20
WHERE tier='free';

UPDATE customers
SET monthly_quota=0,
    rate_limit_per_minute=10
WHERE tier='free';
