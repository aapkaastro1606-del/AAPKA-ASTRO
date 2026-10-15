const path = require('path');
const { PrismaClient } = require(path.join(process.cwd(), 'node_modules', '@prisma', 'client'));
const fs = require('fs');

function loadEnvFile(p) {
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    for (const l of lines) {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const k = trimmed.slice(0, eq).trim();
      let v = trimmed.slice(eq + 1).trim();
      v = v.replace(/^["']|["']$/g, '');
      if (!process.env[k]) process.env[k] = v;
    }
  }
}
loadEnvFile('.env.local');
loadEnvFile('.env');

const prisma = new PrismaClient();

async function main() {
  console.log('Querying raw enums and users table directly...');
  
  // Check UserRole enum values in postgres
  const enumVals = await prisma.$queryRaw`
    SELECT t.typname, e.enumlabel
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    ORDER BY t.typname, e.enumsortorder;
  `;
  console.log('Postgres enum labels in public schema:');
  console.log(enumVals);

  // Check columns of users table
  const userCols = await prisma.$queryRaw`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'users';
  `;
  console.log('Columns of users table:');
  console.log(userCols);

  // Query users raw
  const rawUsers = await prisma.$queryRaw`SELECT * FROM "users";`;
  console.log('Raw users rows:', rawUsers);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error in main:', err);
  process.exit(1);
});
