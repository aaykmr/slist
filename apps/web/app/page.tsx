"use client";

import { useCallback, useEffect, useState } from "react";
import { CandidateTable } from "@/components/CandidateTable";
import { FilterBar } from "@/components/FilterBar";
import { JobStatus } from "@/components/JobStatus";
import { UploadForm } from "@/components/UploadForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clearAuthToken, fetchJson, setAuthToken } from "@/lib/api";
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

type AuthResponse = {
  token: string;
  user: { id: string; email: string; companyId: string };
};

function AuthPanel({ onAuthed }: { onAuthed: () => void }) {
  const [email, setEmail] = useState("admin@slist.dev");
  const [password, setPassword] = useState("admin12345");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(path: "/auth/login" | "/auth/register") {
    setBusy(true);
    setError(null);
    try {
      const data = await fetchJson<AuthResponse>(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.token);
      onAuthed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto mt-8 max-w-xl px-4">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Use seeded account or register a new one.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <Button disabled={busy} onClick={() => void submit("/auth/login")}>
              {busy ? "Please wait..." : "Login"}
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => void submit("/auth/register")}
            >
              Register
            </Button>
          </div>
          {error ? <div className="text-sm text-destructive">{error}</div> : null}
        </CardContent>
      </Card>
    </section>
  );
}

export default function HomePage() {
  const [authed, setAuthed] = useState(false);
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

  const reloadAuth = useCallback(async () => {
    try {
      await fetchJson<{ user: { id: string } }>("/auth/me");
      setAuthed(true);
    } catch {
      setAuthed(false);
    }
  }, []);

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
    void reloadAuth().catch(console.error);
  }, [reloadAuth]);

  useEffect(() => {
    if (!authed) return;
    void reloadMeta().catch(console.error);
    void reloadList().catch(console.error);
  }, [authed, reloadMeta, reloadList]);

  const onJobComplete = useCallback(() => {
    void reloadMeta();
    void reloadList();
  }, [reloadMeta, reloadList]);

  if (!authed) {
    return <AuthPanel onAuthed={() => setAuthed(true)} />;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-6">
      <header className="mb-6">
        <h1 className="mb-1 text-2xl font-bold">slist</h1>
        <p className="text-muted-foreground">
          Upload PDF resumes, parse with AI, filter by skills and job profile.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="mt-3"
          onClick={() => {
            clearAuthToken();
            setAuthed(false);
          }}
        >
          Logout
        </Button>
      </header>

      <UploadForm onJobCreated={setJobId} />
      <JobStatus jobId={jobId} onComplete={onJobComplete} />

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
