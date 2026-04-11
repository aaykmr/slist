import Link from "next/link";
import { notFound } from "next/navigation";
import { apiUrl } from "@/lib/api";

type PageProps = { params: Promise<{ id: string }> };

export default async function CandidateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const res = await fetch(apiUrl(`/candidates/${id}`), {
    cache: "no-store",
  });
  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error("Failed to load candidate");
  }
  const c = (await res.json()) as {
    id: string;
    displayName: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    summary: string | null;
    seniority: string | null;
    yearsExperience: number | null;
    primaryRole: string | null;
    experiences: Array<{
      id: string;
      title: string;
      company: string;
      startDate: string | null;
      endDate: string | null;
      description: string | null;
    }>;
    educations: Array<{
      id: string;
      institution: string;
      degree: string | null;
      field: string | null;
      endDate: string | null;
    }>;
    skills: Array<{ skill: { slug: string; label: string } }>;
    jobProfileMatches: Array<{ jobProfile: { slug: string; label: string } }>;
  };

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem" }}>
      <p>
        <Link href="/">← Back</Link>
      </p>
      <h1 style={{ marginTop: 0 }}>
        {c.displayName ?? c.email ?? "Candidate"}
      </h1>
      <p style={{ color: "var(--muted)" }}>
        {[c.primaryRole, c.seniority, c.location].filter(Boolean).join(" · ")}
      </p>
      {c.summary ? (
        <section style={{ marginTop: "1.25rem" }}>
          <h2 style={{ fontSize: "1rem" }}>Summary</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{c.summary}</p>
        </section>
      ) : null}
      <section style={{ marginTop: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem" }}>Experience</h2>
        <ul style={{ paddingLeft: "1.1rem" }}>
          {c.experiences.map((e) => (
            <li key={e.id} style={{ marginBottom: "0.75rem" }}>
              <strong>{e.title}</strong> — {e.company}
              <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                {e.startDate ?? "?"} – {e.endDate ?? "present"}
              </div>
              {e.description ? (
                <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                  {e.description}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      <section style={{ marginTop: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem" }}>Education</h2>
        <ul style={{ paddingLeft: "1.1rem" }}>
          {c.educations.map((e) => (
            <li key={e.id}>
              {e.institution}
              {e.degree ? ` — ${e.degree}` : ""}
              {e.field ? ` (${e.field})` : ""}
              {e.endDate ? `, ${e.endDate}` : ""}
            </li>
          ))}
        </ul>
      </section>
      <section style={{ marginTop: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem" }}>Skills</h2>
        <p>{c.skills.map((s) => s.skill.label).join(", ") || "—"}</p>
      </section>
      <section style={{ marginTop: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem" }}>Job profiles</h2>
        <p>
          {c.jobProfileMatches.map((j) => j.jobProfile.label).join(", ") || "—"}
        </p>
      </section>
    </main>
  );
}
