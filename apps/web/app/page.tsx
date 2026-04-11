"use client";

import { useCallback, useEffect, useState } from "react";
import { CandidateTable } from "@/components/CandidateTable";
import { FilterBar } from "@/components/FilterBar";
import { JobStatus } from "@/components/JobStatus";
import { UploadForm } from "@/components/UploadForm";
import { fetchJson } from "@/lib/api";
import type {
  CandidateListResponse,
  JobProfileOpt,
  SkillOpt,
} from "@/lib/types";

type Filters = { q: string; skills: string[]; profiles: string[] };

function buildQuery(params: {
  page: number;
  pageSize: number;
} & Filters): string {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));
  if (params.q.trim()) sp.set("q", params.q.trim());
  for (const s of params.skills) sp.append("skill", s);
  for (const p of params.profiles) sp.append("jobProfile", p);
  return `?${sp.toString()}`;
}

export default function HomePage() {
  const [skills, setSkills] = useState<SkillOpt[]>([]);
  const [jobProfiles, setJobProfiles] = useState<JobProfileOpt[]>([]);
  const [draft, setDraft] = useState<Filters>({
    q: "",
    skills: [],
    profiles: [],
  });
  const [applied, setApplied] = useState<Filters>({
    q: "",
    skills: [],
    profiles: [],
  });
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [list, setList] = useState<CandidateListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobId, setJobId] = useState<string | null>(null);

  const reloadMeta = useCallback(async () => {
    const [s, jp] = await Promise.all([
      fetchJson<SkillOpt[]>("/meta/skills"),
      fetchJson<JobProfileOpt[]>("/meta/job-profiles"),
    ]);
    setSkills(s);
    setJobProfiles(jp);
  }, []);

  const reloadList = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildQuery({
        page,
        pageSize,
        ...applied,
      });
      const data = await fetchJson<CandidateListResponse>(`/candidates${qs}`);
      setList(data);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, applied]);

  useEffect(() => {
    void reloadMeta().catch(console.error);
  }, [reloadMeta]);

  useEffect(() => {
    void reloadList().catch(console.error);
  }, [reloadList]);

  const onJobComplete = useCallback(() => {
    void reloadMeta();
    void reloadList();
  }, [reloadMeta, reloadList]);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.5rem" }}>slist</h1>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          Upload PDF resumes, parse with OpenAI, filter by skills and job profile.
        </p>
      </header>

      <UploadForm onJobCreated={setJobId} />
      <JobStatus jobId={jobId} onComplete={onJobComplete} />

      <div style={{ height: "1rem" }} />

      <FilterBar
        skills={skills}
        jobProfiles={jobProfiles}
        selectedSkills={draft.skills}
        selectedProfiles={draft.profiles}
        q={draft.q}
        onSkillsChange={(skills) => setDraft((d) => ({ ...d, skills }))}
        onProfilesChange={(profiles) => setDraft((d) => ({ ...d, profiles }))}
        onQChange={(q) => setDraft((d) => ({ ...d, q }))}
        onApply={() => {
          setApplied(draft);
          setPage(1);
        }}
      />

      <div style={{ height: "1rem" }} />

      <CandidateTable
        rows={list?.items ?? []}
        loading={loading}
        page={list?.page ?? page}
        total={list?.total ?? 0}
        pageSize={list?.pageSize ?? pageSize}
        onPageChange={(p) => setPage(p)}
      />
    </main>
  );
}
