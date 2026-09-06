import { readFileSync, existsSync } from "node:fs";

const required = [
  "CLAUDE.md",
  "docs/ARCHITECTURE.md",
  "docs/ENGINEERING-CHECKLIST.md",
  "docs/PLAN-V2.md",
  "skills/secure-saas-build/SKILL.md",
  "demo/index.html",
  "auth/src/index.ts",
  "worker/src/index.ts",
  "worker/migrations/0021_google_access_lists.sql",
  "openapi.yaml",
];

for (const path of required) {
  if (!existsSync(path)) throw new Error(`Missing required project artifact: ${path}`);
}

const index = readFileSync("demo/index.html", "utf8");
const claude = readFileSync("CLAUDE.md", "utf8");
const architecture = readFileSync("docs/ARCHITECTURE.md", "utf8");
const auth = readFileSync("auth/src/index.ts", "utf8");
const gateway = readFileSync("worker/src/index.ts", "utf8");
const migration = readFileSync("worker/migrations/0021_google_access_lists.sql", "utf8");
const openapi = readFileSync("openapi.yaml", "utf8");

const versionContract = gateway.match(/\{name:\"Momentum API\",version:\"([^\"]+)\",engine:\"([^\"]+)\",auth:\"([^\"]+)\",access:\"([^\"]+)\"\}/);
if (!versionContract) throw new Error("Gateway version contract is missing");
const [, apiVersion, engineVersion, authVersion, accessMode] = versionContract;

const assertions = [
  [index.includes("Sign in with Google"), "demo must expose Google sign-in"],
  [index.includes("Gmail"), "demo must explain Gmail-only access"],
  [index.includes("https://momentum-api-public.manikandanruki2004.workers.dev"), "demo must target the production gateway"],
  [!index.toLowerCase().includes("razorpay"), "demo must not contain payment-provider UI"],
  [!gateway.toLowerCase().includes("razorpay"), "gateway must not contain payment-provider routes"],
  [!gateway.includes("BILLING"), "gateway must not bind a billing worker"],
  [auth.includes("normalizeGmail"), "auth must validate Gmail addresses"],
  [auth.includes("google_pro_accounts"), "auth must use the separate Pro Gmail access list"],
  [auth.includes("google_free_accounts"), "auth must use the separate Free Gmail access list"],
  [auth.includes("/admin/pro/grant"), "auth must support explicit Pro grants"],
  [auth.includes("/admin/pro/revoke"), "auth must support explicit Pro revokes"],
  [migration.includes("CREATE TABLE IF NOT EXISTS google_free_accounts"), "Free Gmail access table missing"],
  [migration.includes("CREATE TABLE IF NOT EXISTS google_pro_accounts"), "Pro Gmail access table missing"],
  [migration.includes("DROP TABLE IF EXISTS razorpay_subscriptions"), "legacy payment state must be removed"],
  [claude.includes("Every outbound network call has a bounded timeout"), "reliability rule missing from CLAUDE.md"],
  [claude.includes("Make retryable mutations idempotent"), "idempotency rule missing from CLAUDE.md"],
  [architecture.includes("Gmail"), "architecture must document Gmail access"],
  [openapi.includes(`  version: ${apiVersion}`), "OpenAPI version must match gateway"],
  [openapi.includes("Gmail-only browser access"), "OpenAPI must document Gmail access"],
  [openapi.includes("/admin/pro/grant:"), "OpenAPI must document Pro grants"],
  [openapi.includes("/admin/pro/revoke:"), "OpenAPI must document Pro revokes"],
  [accessMode === "gmail", "gateway access mode must be gmail"],
];

for (const [ok, message] of assertions) {
  if (!ok) throw new Error(message);
}

console.log(`Momentum engineering contract checks passed (API ${apiVersion}, engine ${engineVersion}, auth ${authVersion}, access ${accessMode}).`);
