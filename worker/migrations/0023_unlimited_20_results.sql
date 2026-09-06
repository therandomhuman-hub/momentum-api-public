-- Unlimited usage model.
-- No monthly request quota; infrastructure rate limiting remains for abuse protection.
-- Return up to 20 repositories per scan.

UPDATE plans
SET monthly_quota=0,
    max_results=20
WHERE tier='free';

UPDATE customers
SET monthly_quota=0
WHERE tier='free';
