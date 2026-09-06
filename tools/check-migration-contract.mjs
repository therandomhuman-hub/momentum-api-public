import fs from 'node:fs';

const dir = 'worker/migrations';
const files = fs.readdirSync(dir).filter(name => /^\d{4}_.+\.sql$/.test(name)).sort();
if (!files.length) throw new Error('No numbered D1 migrations found.');
const prefixes = files.map(name => Number(name.slice(0, 4)));
if (prefixes[0] !== 8) throw new Error(`Unexpected D1 migration baseline: found ${files[0].slice(0, 4)}.`);
for (let i = 1; i < prefixes.length; i++) {
  const delta = prefixes[i] - prefixes[i - 1];
  if (delta < 0 || delta > 1) throw new Error(`D1 migration ordering/gap regression: ${files[i - 1]} -> ${files[i]}.`);
}
const duplicateNumbers = prefixes.filter((value, index) => index > 0 && value === prefixes[index - 1]);
if (duplicateNumbers.some(value => value !== 16)) throw new Error(`Unexpected duplicate D1 migration number: ${duplicateNumbers.join(', ')}`);
for (const required of ['0013_google_auth.sql','0014_free_plan_10_results.sql','0017_auth_rate_limit.sql','0021_google_access_lists.sql','0023_unlimited_20_results.sql']) {
  if (!files.includes(required)) throw new Error(`Missing required migration: ${required}`);
}
const access = fs.readFileSync(`${dir}/0021_google_access_lists.sql`, 'utf8');
for (const needle of [
  'CREATE TABLE IF NOT EXISTS google_free_accounts',
  'CREATE TABLE IF NOT EXISTS google_pro_accounts',
  "lower(trim(email)) LIKE '%@gmail.com'",
  'DROP TABLE IF EXISTS razorpay_subscriptions',
  'DROP TABLE IF EXISTS razorpay_webhook_events',
]) {
  if (!access.includes(needle)) throw new Error(`Standalone access migration contract missing: ${needle}`);
}
const production = fs.readFileSync(`${dir}/0023_unlimited_20_results.sql`, 'utf8');
for (const needle of ['monthly_quota=100', 'rate_limit_per_minute=10', 'max_results=10']) {
  if (!production.includes(needle)) throw new Error(`Production plan migration contract missing: ${needle}`);
}
if (production.includes('monthly_quota=0') || production.includes('max_results=20')) {
  throw new Error('Production migration still contains retired unlimited/20-result semantics.');
}
console.log(`D1 migration contract passed (${files.length} migrations, baseline ${files[0].slice(0, 4)}).`);
