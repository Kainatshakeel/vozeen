import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { demoProducts } from "../src/lib/catalog";
const db = new PrismaClient();
async function main() {
  // Reverse so the first catalog entries get the newest createdAt and lead the storefront.
  for (const p of [...demoProducts].reverse()) {
    const { variants, id, ...data } = p;
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...data, id, variants: { create: variants } },
    });
  }
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 12)
      throw new Error("Admin password needs at least 12 characters");
    await db.user.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: {},
      create: {
        name: "Vozeen Studio",
        email: process.env.ADMIN_EMAIL,
        passwordHash: await hash(process.env.ADMIN_PASSWORD, 12),
        role: "ADMIN",
      },
    });
  }
}
main().finally(() => db.$disconnect());
