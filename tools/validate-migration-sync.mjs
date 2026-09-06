import fs from "node:fs";

const migrationDir = "worker/migrations";
const deployWorkflow = fs.readFileSync(".github/workflows/deploy-momentum-stack.yml", "utf8");
const files = fs.readdirSync(migrationDir).filter(name => /^\d{4}_.+\.sql$/.test(name)).sort();
if (!files.length) throw new Error("No numbered D1 migrations found.");
if (!deployWorkflow.includes('for migration in worker/migrations/*.sql')) {
  throw new Error("Deploy workflow must sync the complete public D1 migration directory into the private engine checkout.");
}
console.log(`Migration sync contract passed for ${files.length} migrations.`);
