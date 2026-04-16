"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchJson } from "@/lib/api";
import { cn } from "@/lib/utils";

type Candidate = {
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

export default function CandidateDetailPage() {
  const params = useParams<{ id: string }>();
  const [c, setC] = useState<Candidate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id;
    if (!id) return;
    void fetchJson<Candidate>(`/candidates/${id}`)
      .then((data) => setC(data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load candidate"));
  }, [params.id]);

  if (error) {
    return <main className="p-6 text-destructive">{error}</main>;
  }
  if (!c) {
    return <main className="p-6">Loading...</main>;
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <div>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          ← Back
        </Link>
      </div>
      <h1 className="text-2xl font-bold">
        {c.displayName ?? c.email ?? "Candidate"}
      </h1>
      <p className="text-muted-foreground">
        {[c.primaryRole, c.seniority, c.location].filter(Boolean).join(" · ")}
      </p>
      {c.summary ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap">{c.summary}</CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-3">
          {c.experiences.map((e) => (
              <li key={e.id}>
              <strong>{e.title}</strong> — {e.company}
                <div className="text-sm text-muted-foreground">
                {e.startDate ?? "?"} – {e.endDate ?? "present"}
              </div>
              {e.description ? (
                  <div className="mt-1 whitespace-pre-wrap">
                  {e.description}
                </div>
              ) : null}
            </li>
          ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Education</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1">
          {c.educations.map((e) => (
            <li key={e.id}>
              {e.institution}
              {e.degree ? ` — ${e.degree}` : ""}
              {e.field ? ` (${e.field})` : ""}
              {e.endDate ? `, ${e.endDate}` : ""}
            </li>
          ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills</CardTitle>
        </CardHeader>
        <CardContent>{c.skills.map((s) => s.skill.label).join(", ") || "—"}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {c.jobProfileMatches.map((j) => j.jobProfile.label).join(", ") || "—"}
        </CardContent>
      </Card>
    </main>
  );
}
