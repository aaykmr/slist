import { PrismaClient } from "@prisma/client";

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

  console.log(
    "Seed OK. Use DEFAULT_COMPANY_SLUG=demo (default) or DEFAULT_COMPANY_ID=",
    company.id
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
