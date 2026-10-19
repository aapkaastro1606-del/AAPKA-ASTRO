import { seedContentModel } from "../src/lib/content/contentSeeder";
import { prisma } from "../src/lib/db/prisma";

async function main() {
  console.log("----------------------------------------------------------------");
  console.log("AAPKA ASTRO - SEEDING CONTENT MODEL & MEDIA ASSETS");
  console.log("----------------------------------------------------------------");

  const result = await seedContentModel({ overwrite: process.argv.includes("--overwrite") });
  console.log("Result:", result.message);

  if (prisma) {
    await prisma.$disconnect();
  }

  if (!result.success) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
