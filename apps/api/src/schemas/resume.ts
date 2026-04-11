import { z } from "zod";

/** LLMs often emit numbers for years or null instead of omitting optional arrays. */
const nullableStringish = z
  .union([z.string(), z.number()])
  .nullable()
  .transform((v) => (v === null ? null : String(v)));

const looseStringArray = z
  .union([z.array(z.string()), z.null()])
  .optional()
  .transform((v) => v ?? []);

const yearsExperienceLoose = z
  .union([z.number(), z.string()])
  .nullable()
  .transform((v) => {
    if (v === null) return null;
    const n = typeof v === "string" ? Number.parseFloat(v) : v;
    if (Number.isNaN(n)) return null;
    return Math.round(Math.min(60, Math.max(0, n)));
  });

export const senioritySchema = z.enum([
  "intern",
  "junior",
  "mid",
  "senior",
  "lead",
  "principal",
  "executive",
  "unknown",
]);

export const resumeExtractionSchema = z.object({
  contact: z.object({
    fullName: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
  }),
  summary: z.string().nullable(),
  seniority: senioritySchema.optional(),
  yearsExperienceApprox: yearsExperienceLoose,
  primaryRole: z.string().nullable(),
  jobProfileLabels: z
    .array(z.string())
    .describe(
      "0–5 labels from the standard list when possible: Backend Engineer, Frontend Engineer, Full Stack Engineer, Data Engineer, ML Engineer, DevOps / SRE, Product Manager, Mobile Engineer"
    ),
  skills: z.array(z.string()),
  workHistory: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      startDate: nullableStringish,
      endDate: nullableStringish,
      description: z.string().nullable(),
    })
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string().nullable(),
      field: z.string().nullable(),
      endDate: nullableStringish,
    })
  ),
  certifications: looseStringArray,
  languages: looseStringArray,
});

export type ResumeExtraction = z.infer<typeof resumeExtractionSchema>;
