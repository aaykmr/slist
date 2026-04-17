"use client";

import { useEffect, useRef, useState } from "react";
import { apiUrl, getAuthToken } from "@/lib/api";
import type { ParseJobResponse } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  jobId: string | null;
  onComplete: () => void;
  statusPathPrefix?: string;
  includeAuth?: boolean;
};

export function JobStatus({
  jobId,
  onComplete,
  statusPathPrefix = "/resumes/jobs",
  includeAuth = true,
}: Props) {
  const [job, setJob] = useState<ParseJobResponse | null>(null);
  const notifiedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    notifiedRef.current = false;
    if (!jobId) {
      setJob(null);
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const stopPolling = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const tick = async () => {
      try {
        const token = includeAuth ? getAuthToken() : null;
        const res = await fetch(apiUrl(`${statusPathPrefix}/${jobId}`), {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;
        const data = (await res.json()) as ParseJobResponse;
        if (cancelled) return;
        setJob(data);

        if (data.status === "COMPLETED" || data.status === "FAILED") {
          stopPolling();
          if (!notifiedRef.current) {
            notifiedRef.current = true;
            onCompleteRef.current();
          }
        }
      } catch {
        /* ignore */
      }
    };

    void tick();
    intervalId = setInterval(tick, 2000);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [jobId]);

  if (!jobId || !job) return null;

  return (
    <Card className="mt-3 text-sm">
      <CardContent className="space-y-2 pt-4">
        <div>
        Parse job <code>{job.id.slice(0, 8)}…</code>:{" "}
          <strong>{job.status}</strong>
          {job.originalName ? ` — ${job.originalName}` : null}
        </div>
      {job.status === "FAILED" && job.errorMessage ? (
          <div className="text-destructive">{job.errorMessage}</div>
      ) : null}
      {job.status === "COMPLETED" && job.candidate ? (
          <div>
          Candidate saved: {job.candidate.displayName ?? job.candidate.id}
        </div>
      ) : null}
      </CardContent>
    </Card>
  );
}
