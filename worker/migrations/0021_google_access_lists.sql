-- Standalone Google-account access model.
-- Any verified Gmail account receives Free access automatically.
-- Pro access is granted explicitly by email; no payment provider is involved.

CREATE TABLE IF NOT EXISTS google_free_accounts (
  email TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS google_pro_accounts (
  email TEXT PRIMARY KEY
);

INSERT OR IGNORE INTO google_pro_accounts(email)
SELECT lower(trim(email))
FROM customers
WHERE email IS NOT NULL
  AND lower(trim(email)) LIKE '%@gmail.com'
  AND tier = 'pro';

INSERT OR IGNORE INTO google_free_accounts(email)
SELECT lower(trim(email))
FROM customers
WHERE email IS NOT NULL
  AND lower(trim(email)) LIKE '%@gmail.com'
  AND tier <> 'pro';

DELETE FROM google_free_accounts
WHERE email IN (SELECT email FROM google_pro_accounts);

UPDATE customers
SET name = 'Google account',
    google_sub = NULL
WHERE email IS NOT NULL;

DROP TRIGGER IF EXISTS trg_sync_customer_entitlement_insert;
DROP TRIGGER IF EXISTS trg_sync_customer_entitlement_update;
DROP TRIGGER IF EXISTS trg_sync_customer_entitlement_delete;
DROP TRIGGER IF EXISTS trg_sync_razorpay_customer_id_insert;
DROP TRIGGER IF EXISTS trg_sync_razorpay_customer_id_update;

DROP TABLE IF EXISTS razorpay_checkout_attempts;
DROP TABLE IF EXISTS razorpay_webhook_events;
DROP TABLE IF EXISTS razorpay_unclaimed_subscriptions;
DROP TABLE IF EXISTS razorpay_subscriptions;
