import type { JobProfile } from "@prisma/client";
import { skillSlug } from "../lib/slug.js";

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function matchJobProfileIds(
  labels: string[],
  profiles: JobProfile[]
): string[] {
  const ids: string[] = [];
  for (const label of labels) {
    const slug = skillSlug(label);
    const n = norm(label);
    let found =
      profiles.find((p) => p.slug === slug) ||
      profiles.find((p) => norm(p.label) === n) ||
      profiles.find(
        (p) => norm(p.label).includes(n) || n.includes(norm(p.label))
      );
    if (found) ids.push(found.id);
  }
  return [...new Set(ids)];
}
