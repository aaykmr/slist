"use client";

import { useState } from "react";
import { apiUrl, getAuthToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
      const token = getAuthToken();
      const res = await fetch(apiUrl("/resumes"), {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-3">
          <strong className="mr-2">Upload resume (PDF)</strong>
          <Input
            name="file"
            type="file"
            accept=".pdf,application/pdf"
            className="max-w-sm file:text-foreground"
          />
          <Button type="submit" disabled={busy}>
            {busy ? "Uploading..." : "Upload"}
          </Button>
          {error ? <span className="w-full text-sm text-destructive">{error}</span> : null}
        </form>
      </CardContent>
    </Card>
  );
}
