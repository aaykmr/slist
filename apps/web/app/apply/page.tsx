"use client";

import Link from "next/link";
import { useState } from "react";
import { JobStatus } from "@/components/JobStatus";
import { UploadForm } from "@/components/UploadForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./apply.css";

export default function ApplyPage() {
  const [jobId, setJobId] = useState<string | null>(null);

  return (
    <main className="apply-page">
      <section className="apply-hero">
        <h1 className="apply-title">Candidate Resume Submission</h1>
        <p className="apply-subtitle">
          Upload your latest PDF resume. Our parser will read and structure it automatically.
        </p>
      </section>
      <UploadForm
        onJobCreated={setJobId}
        uploadPath="/public/resumes"
        includeAuth={false}
        title="Submit your resume (PDF)"
      />
      <JobStatus
        jobId={jobId}
        onComplete={() => {}}
        statusPathPrefix="/public/resumes/jobs"
        includeAuth={false}
      />
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
        Back to dashboard
      </Link>
    </main>
  );
}
