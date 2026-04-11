import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { resolveDefaultCompanyId } from "../lib/company.js";

export const candidatesRouter = Router();

candidatesRouter.get("/", async (req, res, next) => {
  try {
    const companyId = await resolveDefaultCompanyId();
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const skillSlugs = normalizeMultiParam(stringifyQuery(req.query.skill));
    const jobProfileSlugs = normalizeMultiParam(
      stringifyQuery(req.query.jobProfile)
    );

    const skillFilters: { id: string }[] =
      skillSlugs.length > 0
        ? await prisma.skill.findMany({
            where: { slug: { in: skillSlugs } },
            select: { id: true },
          })
        : [];
    const jpFilters: { id: string }[] =
      jobProfileSlugs.length > 0
        ? await prisma.jobProfile.findMany({
            where: { slug: { in: jobProfileSlugs } },
            select: { id: true },
          })
        : [];

    if (skillSlugs.length && skillFilters.length === 0) {
      res.json({ items: [], total: 0, page, pageSize });
      return;
    }
    if (jobProfileSlugs.length && jpFilters.length === 0) {
      res.json({ items: [], total: 0, page, pageSize });
      return;
    }

    const where = {
      companyId,
      AND: [
        ...(q
          ? [
              {
                OR: [
                  { displayName: { contains: q } },
                  { email: { contains: q } },
                  { primaryRole: { contains: q } },
                  { summary: { contains: q } },
                ],
              },
            ]
          : []),
        ...skillFilters.map((s) => ({
          skills: { some: { skillId: s.id } },
        })),
        ...(jpFilters.length
          ? [
              {
                jobProfileMatches: {
                  some: { jobProfileId: { in: jpFilters.map((j) => j.id) } },
                },
              },
            ]
          : []),
      ],
    };

    const [total, rows] = await Promise.all([
      prisma.candidate.count({ where }),
      prisma.candidate.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          skills: { include: { skill: true } },
          jobProfileMatches: { include: { jobProfile: true } },
        },
      }),
    ]);

    type Row = (typeof rows)[number];

    res.json({
      total,
      page,
      pageSize,
      items: rows.map((c: Row) => ({
        id: c.id,
        displayName: c.displayName,
        email: c.email,
        location: c.location,
        seniority: c.seniority,
        yearsExperience: c.yearsExperience,
        primaryRole: c.primaryRole,
        summary: c.summary,
        skills: c.skills.map((s: Row["skills"][number]) => ({
          slug: s.skill.slug,
          label: s.skill.label,
        })),
        jobProfiles: c.jobProfileMatches.map(
          (j: Row["jobProfileMatches"][number]) => ({
            slug: j.jobProfile.slug,
            label: j.jobProfile.label,
          })
        ),
        updatedAt: c.updatedAt,
      })),
    });
  } catch (e) {
    next(e);
  }
});

candidatesRouter.get("/:id", async (req, res, next) => {
  try {
    const companyId = await resolveDefaultCompanyId();
    const c = await prisma.candidate.findFirst({
      where: { id: req.params.id, companyId },
      include: {
        experiences: { orderBy: { sortOrder: "asc" } },
        educations: { orderBy: { sortOrder: "asc" } },
        skills: { include: { skill: true } },
        jobProfileMatches: { include: { jobProfile: true } },
      },
    });
    if (!c) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(c);
  } catch (e) {
    next(e);
  }
});

function stringifyQuery(
  v: unknown
): string | string[] | undefined {
  if (v === undefined) return undefined;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map((x) => String(x));
  return undefined;
}

function normalizeMultiParam(
  v: string | string[] | undefined
): string[] {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : [v];
  const out: string[] = [];
  for (const x of arr) {
    for (const part of x.split(",")) {
      const s = part.trim().toLowerCase();
      if (s) out.push(s);
    }
  }
  return [...new Set(out)];
}
