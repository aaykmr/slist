"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api";

type Props = {
  onJobCreated: (jobId: string) => void;
};

export function UploadForm({ onJobCreated }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const input = form.elements.namedItem("file") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      setError("Choose a PDF file");
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(apiUrl("/resumes"), {
        method: "POST",
        body,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Upload failed");
      }
      const data = (await res.json()) as { jobId: string };
      onJobCreated(data.jobId);
      input.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        padding: "1rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
      }}
    >
      <strong style={{ marginRight: "0.5rem" }}>Upload resume (PDF)</strong>
      <input name="file" type="file" accept=".pdf,application/pdf" />
      <button
        type="submit"
        disabled={busy}
        style={{
          padding: "0.4rem 0.9rem",
          borderRadius: 6,
          border: "1px solid var(--border)",
          background: busy ? "#333" : "var(--accent)",
          color: "#0f1115",
        }}
      >
        {busy ? "Uploading…" : "Upload"}
      </button>
      {error ? (
        <span style={{ color: "#f88", width: "100%" }}>{error}</span>
      ) : null}
    </form>
  );
}
