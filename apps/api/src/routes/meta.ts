import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const metaRouter = Router();

metaRouter.get("/skills", async (req, res, next) => {
  try {
    const companyId = req.auth!.companyId;
    const used = await prisma.candidateSkill.findMany({
      where: { candidate: { companyId } },
      select: { skillId: true },
      distinct: ["skillId"],
    });
    const ids = used.map((u) => u.skillId);
    const skills = await prisma.skill.findMany({
      where: { id: { in: ids } },
      orderBy: { label: "asc" },
    });
    res.json(skills.map((s) => ({ slug: s.slug, label: s.label })));
  } catch (e) {
    next(e);
  }
});

metaRouter.get("/job-profiles", async (_req, res, next) => {
  try {
    const rows = await prisma.jobProfile.findMany({ orderBy: { label: "asc" } });
    res.json(rows.map((r) => ({ slug: r.slug, label: r.label })));
  } catch (e) {
    next(e);
  }
});
