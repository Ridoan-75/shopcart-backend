import { PrismaClient } from "../generated/prisma/client";
import { Role } from "../generated/prisma/enums";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding started...");

  // ─── Admin ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL! },
    update: {},
    create: {
      name: "Super Admin",
      email: process.env.SEED_ADMIN_EMAIL!,
      password: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD!, 12),
      role: Role.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // ─── Seller ─────────────────────────────────────────────────────────────────
  const seller = await prisma.user.upsert({
    where: { email: process.env.SEED_SELLER_EMAIL! },
    update: {},
    create: {
      name: "Test Seller",
      email: process.env.SEED_SELLER_EMAIL!,
      password: await bcrypt.hash(process.env.SEED_SELLER_PASSWORD!, 12),
      role: Role.SELLER,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log("✅ Seller created:", seller.email);

  // ─── User ───────────────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: process.env.SEED_USER_EMAIL! },
    update: {},
    create: {
      name: "Test User",
      email: process.env.SEED_USER_EMAIL!,
      password: await bcrypt.hash(process.env.SEED_USER_PASSWORD!, 12),
      role: Role.USER,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log("✅ User created:", user.email);

  console.log("\n🌿 Seeding completed!");
  console.log(`   👑 Admin  → ${process.env.SEED_ADMIN_EMAIL} / ${process.env.SEED_ADMIN_PASSWORD}`);
  console.log(`   🏪 Seller → ${process.env.SEED_SELLER_EMAIL} / ${process.env.SEED_SELLER_PASSWORD}`);
  console.log(`   👤 User   → ${process.env.SEED_USER_EMAIL} / ${process.env.SEED_USER_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });