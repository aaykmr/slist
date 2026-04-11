"use client";

import { useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";
import type { ParseJobResponse } from "@/lib/types";

type Props = {
  jobId: string | null;
  onComplete: () => void;
};

export function JobStatus({ jobId, onComplete }: Props) {
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
        const res = await fetch(apiUrl(`/resumes/jobs/${jobId}`));
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
    <div
      style={{
        marginTop: "0.75rem",
        padding: "0.75rem 1rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        fontSize: "0.9rem",
      }}
    >
      <div>
        Parse job <code>{job.id.slice(0, 8)}…</code>:{" "}
        <strong>{job.status}</strong>
        {job.originalName ? ` — ${job.originalName}` : null}
      </div>
      {job.status === "FAILED" && job.errorMessage ? (
        <div style={{ color: "#f88", marginTop: 6 }}>{job.errorMessage}</div>
      ) : null}
      {job.status === "COMPLETED" && job.candidate ? (
        <div style={{ marginTop: 6 }}>
          Candidate saved: {job.candidate.displayName ?? job.candidate.id}
        </div>
      ) : null}
    </div>
  );
}
