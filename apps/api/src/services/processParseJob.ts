import { readFile } from "node:fs/promises";
import { prisma } from "../lib/prisma.js";
import { skillSlug } from "../lib/slug.js";
import { extractTextFromPdf } from "./pdfText.js";
import { parseResumeWithLlm } from "./parseResume.js";
import { matchJobProfileIds } from "./jobProfiles.js";

export async function processParseJob(jobId: string): Promise<void> {
  const job = await prisma.parseJob.findUnique({ where: { id: jobId } });
  if (!job || !job.storedPath) return;

  await prisma.parseJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING" },
  });

  try {
    const buf = await readFile(job.storedPath);
    const lower = (job.originalName ?? "").toLowerCase();
    if (!lower.endsWith(".pdf")) {
      throw new Error("Only PDF uploads are supported in this build");
    }
    const rawText = await extractTextFromPdf(buf);
    if (!rawText || rawText.length < 20) {
      throw new Error("Could not extract enough text from PDF");
    }

    const { data, raw } = await parseResumeWithLlm(rawText);
    const profiles = await prisma.jobProfile.findMany();
    const jobProfileIds = matchJobProfileIds(data.jobProfileLabels ?? [], profiles);

    await prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.create({
        data: {
          companyId: job.companyId,
          parseJobId: job.id,
          displayName: data.contact.fullName,
          email: data.contact.email,
          phone: data.contact.phone,
          location: data.contact.location,
          summary: data.summary,
          rawText,
          seniority: data.seniority ?? null,
          yearsExperience: data.yearsExperienceApprox ?? null,
          primaryRole: data.primaryRole,
          structuredJson: data as object,
          experiences: {
            create: data.workHistory.map((w, i) => ({
              title: w.title,
              company: w.company,
              startDate: w.startDate,
              endDate: w.endDate,
              description: w.description,
              sortOrder: i,
            })),
          },
          educations: {
            create: data.education.map((e, i) => ({
              institution: e.institution,
              degree: e.degree,
              field: e.field,
              endDate: e.endDate,
              sortOrder: i,
            })),
          },
        },
      });

      for (let i = 0; i < data.skills.length; i++) {
        const label = data.skills[i].trim();
        if (!label) continue;
        const slug = skillSlug(label);
        const skill = await tx.skill.upsert({
          where: { slug },
          create: { slug, label },
          update: { label },
        });
        await tx.candidateSkill.upsert({
          where: {
            candidateId_skillId: { candidateId: candidate.id, skillId: skill.id },
          },
          create: { candidateId: candidate.id, skillId: skill.id },
          update: {},
        });
      }

      for (const jpId of jobProfileIds) {
        await tx.candidateJobProfile.create({
          data: { candidateId: candidate.id, jobProfileId: jpId },
        });
      }
    });

    await prisma.parseJob.update({
      where: { id: jobId },
      data: { status: "COMPLETED", rawLlmOutput: raw },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Parse failed";
    await prisma.parseJob.update({
      where: { id: jobId },
      data: { status: "FAILED", errorMessage: message },
    });
  }
}
