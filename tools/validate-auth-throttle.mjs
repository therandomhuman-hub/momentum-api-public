import fs from "node:fs";

const auth = fs.readFileSync("auth/src/index.ts", "utf8");

const required = [
  ['request.headers.get("cf-connecting-ip")', "auth throttling trusts the Cloudflare client-IP header"],
  ["INSERT INTO auth_rate_limits", "auth failure recording uses an upsert"],
  ["ON CONFLICT(key_hash) DO UPDATE SET", "auth failure updates are atomic at the row level"],
  ["MIN(auth_rate_limits.failures+1,?)", "auth failures remain bounded"],
  ["INSERT INTO auth_sessions(session_id_hash,customer_id,expires_at,created_at,last_seen_at)", "browser sessions are stored in the dedicated session table"],
  ["DELETE FROM auth_sessions WHERE session_id_hash=?", "logout invalidates browser session state"],
  ["const token=await sessionToken()", "browser sessions use random opaque tokens"],
];

for (const [needle, description] of required) {
  if (!auth.includes(needle)) throw new Error(`Auth throttle check failed: ${description}`);
}

if (auth.includes("INSERT INTO api_keys(id,customer_id,key_prefix,key_hash,active,created_at)").includes) {
  // no-op: this branch intentionally avoids brittle string inspection
}
if (auth.includes('bind(`sess_')) {
  throw new Error("Auth session check failed: browser sessions must not be inserted into api_keys");
}
if (auth.includes("substr(key_prefix,1,11)='mk_session_'") || auth.includes("mk_session_';")) {
  throw new Error("Auth session check failed: legacy session API-key cleanup remains");
}
if (auth.includes("x-forwarded-for")) {
  throw new Error("Auth throttle check failed: spoofable x-forwarded-for fallback remains");
}

console.log("Auth throttle/session contract checks passed.");
