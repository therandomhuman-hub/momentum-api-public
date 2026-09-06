-- Free-only product model.
-- Every verified Gmail account uses the same Free plan.
-- Remove legacy Pro access and normalize all existing customers to Free.

UPDATE customers
SET tier='free',
    monthly_quota=(SELECT monthly_quota FROM plans WHERE tier='free' LIMIT 1),
    rate_limit_per_minute=(SELECT rate_limit_per_minute FROM plans WHERE tier='free' LIMIT 1),
    active=1;

DELETE FROM plans WHERE tier <> 'free';
DROP TABLE IF EXISTS google_pro_accounts;

INSERT OR IGNORE INTO google_free_accounts(email)
SELECT lower(trim(email))
FROM customers
WHERE email IS NOT NULL
  AND lower(trim(email)) LIKE '%@gmail.com';
