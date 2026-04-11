"use client";

import type { JobProfileOpt, SkillOpt } from "@/lib/types";

type Props = {
  skills: SkillOpt[];
  jobProfiles: JobProfileOpt[];
  selectedSkills: string[];
  selectedProfiles: string[];
  q: string;
  onSkillsChange: (slugs: string[]) => void;
  onProfilesChange: (slugs: string[]) => void;
  onQChange: (q: string) => void;
  onApply: () => void;
};

export function FilterBar({
  skills,
  jobProfiles,
  selectedSkills,
  selectedProfiles,
  q,
  onSkillsChange,
  onProfilesChange,
  onQChange,
  onApply,
}: Props) {
  function toggleSkill(slug: string) {
    if (selectedSkills.includes(slug)) {
      onSkillsChange(selectedSkills.filter((s) => s !== slug));
    } else {
      onSkillsChange([...selectedSkills, slug]);
    }
  }

  function toggleProfile(slug: string) {
    if (selectedProfiles.includes(slug)) {
      onProfilesChange(selectedProfiles.filter((s) => s !== slug));
    } else {
      onProfilesChange([...selectedProfiles, slug]);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        padding: "1rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
      }}
    >
      <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          Search
        </span>
        <input
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          placeholder="Name, email, role, summary…"
          style={{
            padding: "0.45rem 0.6rem",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--text)",
          }}
        />
      </label>

      <div>
        <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 6 }}>
          Skills (match all selected)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {skills.length === 0 ? (
            <span style={{ color: "var(--muted)" }}>No skills indexed yet</span>
          ) : (
            skills.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => toggleSkill(s.slug)}
                style={{
                  padding: "0.25rem 0.55rem",
                  borderRadius: 999,
                  border: `1px solid ${selectedSkills.includes(s.slug) ? "var(--accent)" : "var(--border)"}`,
                  background: selectedSkills.includes(s.slug)
                    ? "rgba(108, 158, 248, 0.15)"
                    : "transparent",
                  color: "var(--text)",
                }}
              >
                {s.label}
              </button>
            ))
          )}
        </div>
      </div>

      <div>
        <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 6 }}>
          Job profile (any match)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {jobProfiles.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => toggleProfile(p.slug)}
              style={{
                padding: "0.25rem 0.55rem",
                borderRadius: 999,
                border: `1px solid ${selectedProfiles.includes(p.slug) ? "var(--accent)" : "var(--border)"}`,
                background: selectedProfiles.includes(p.slug)
                  ? "rgba(108, 158, 248, 0.15)"
                  : "transparent",
                color: "var(--text)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={onApply}
          style={{
            padding: "0.45rem 1rem",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--accent)",
            color: "#0f1115",
          }}
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}
