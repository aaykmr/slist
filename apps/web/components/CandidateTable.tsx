"use client";

import type { CandidateRow } from "@/lib/types";
import Link from "next/link";

type Props = {
  rows: CandidateRow[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
};

export function CandidateTable({
  rows,
  loading,
  page,
  total,
  pageSize,
  onPageChange,
}: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "auto",
        background: "var(--surface)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "0.65rem" }}>Name</th>
            <th style={{ padding: "0.65rem" }}>Role</th>
            <th style={{ padding: "0.65rem" }}>Seniority</th>
            <th style={{ padding: "0.65rem" }}>Profiles</th>
            <th style={{ padding: "0.65rem" }}>Skills</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} style={{ padding: "1rem", color: "var(--muted)" }}>
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: "1rem", color: "var(--muted)" }}>
                No candidates match these filters.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr
                key={r.id}
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <td style={{ padding: "0.65rem", verticalAlign: "top" }}>
                  <Link href={`/candidates/${r.id}`}>
                    {r.displayName ?? r.email ?? r.id.slice(0, 8)}
                  </Link>
                  {r.email ? (
                    <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                      {r.email}
                    </div>
                  ) : null}
                </td>
                <td style={{ padding: "0.65rem", verticalAlign: "top" }}>
                  {r.primaryRole ?? "—"}
                </td>
                <td style={{ padding: "0.65rem", verticalAlign: "top" }}>
                  {r.seniority ?? "—"}
                  {r.yearsExperience != null ? (
                    <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                      ~{r.yearsExperience} yrs
                    </div>
                  ) : null}
                </td>
                <td style={{ padding: "0.65rem", verticalAlign: "top", maxWidth: 200 }}>
                  {r.jobProfiles.map((p) => p.label).join(", ") || "—"}
                </td>
                <td style={{ padding: "0.65rem", verticalAlign: "top", maxWidth: 280 }}>
                  {r.skills.map((s) => s.label).join(", ") || "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.6rem 0.75rem",
          borderTop: "1px solid var(--border)",
          fontSize: "0.85rem",
          color: "var(--muted)",
        }}
      >
        <span>
          {total} total · page {page} of {pages}
        </span>
        <span style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            style={{
              padding: "0.25rem 0.6rem",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text)",
            }}
          >
            Prev
          </button>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
            style={{
              padding: "0.25rem 0.6rem",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text)",
            }}
          >
            Next
          </button>
        </span>
      </div>
    </div>
  );
}
