const { execSync } = require("child_process");
const { assertStagingEnvironment } = require("./guard");

const args = process.argv.slice(2);
const commandStr = args.join(" ");

const isDestructiveCommand =
  (args.includes("db") && args.includes("push")) ||
  (args.includes("migrate") && args.includes("reset")) ||
  args.includes("reset");

if (isDestructiveCommand) {
  console.log(`[Prisma Guard] Verifying staging environment for destructive command: "prisma ${commandStr}"...`);
  assertStagingEnvironment(`Prisma Guard: prisma ${commandStr}`);
  console.log(`[Prisma Guard] Staging environment verified. Proceeding with "prisma ${commandStr}"...`);
}

try {
  execSync(`npx prisma ${commandStr}`, {
    stdio: "inherit",
    env: process.env,
  });
} catch (err) {
  process.exit(err.status || 1);
}
