-- Corrective production migration for environments where 0023_unlimited_20_results.sql
-- was already applied before the free-plan contract was standardized.

UPDATE plans
SET monthly_quota=100,
    rate_limit_per_minute=10,
    max_results=10
WHERE tier='free';

UPDATE customers
SET monthly_quota=100,
    rate_limit_per_minute=10
WHERE tier='free';
