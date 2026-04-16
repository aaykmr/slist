import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const JOB_PROFILES = [
  { slug: "backend-engineer", label: "Backend Engineer" },
  { slug: "frontend-engineer", label: "Frontend Engineer" },
  { slug: "full-stack-engineer", label: "Full Stack Engineer" },
  { slug: "data-engineer", label: "Data Engineer" },
  { slug: "ml-engineer", label: "ML Engineer" },
  { slug: "devops", label: "DevOps / SRE" },
  { slug: "product-manager", label: "Product Manager" },
  { slug: "mobile-engineer", label: "Mobile Engineer" },
];

async function main() {
  const company = await prisma.company.upsert({
    where: { slug: "demo" },
    create: { slug: "demo", name: "Demo Company" },
    update: { name: "Demo Company" },
  });

  for (const jp of JOB_PROFILES) {
    await prisma.jobProfile.upsert({
      where: { slug: jp.slug },
      create: jp,
      update: { label: jp.label },
    });
  }

  const authEmail = (process.env.SEED_AUTH_EMAIL ?? "admin@slist.dev").toLowerCase();
  const authPassword = process.env.SEED_AUTH_PASSWORD ?? "admin12345";
  const passwordHash = await bcrypt.hash(authPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: authEmail },
    create: {
      email: authEmail,
      passwordHash,
      companyId: company.id,
    },
    update: {
      passwordHash,
      companyId: company.id,
    },
  });

  console.log(
    "Seed OK. Use DEFAULT_COMPANY_SLUG=demo (default) or DEFAULT_COMPANY_ID=",
    company.id
  );
  console.log("Auth seed user:", user.email, "password:", authPassword);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
