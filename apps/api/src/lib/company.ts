import { prisma } from "./prisma.js";

export async function resolveDefaultCompanyId(): Promise<string> {
  const byId = process.env.DEFAULT_COMPANY_ID;
  if (byId) {
    const c = await prisma.company.findUnique({ where: { id: byId } });
    if (c) return c.id;
  }
  const slug = process.env.DEFAULT_COMPANY_SLUG ?? "demo";
  const c = await prisma.company.findUnique({ where: { slug } });
  if (!c) throw new Error("No company found; run prisma db seed");
  return c.id;
}
