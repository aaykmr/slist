"use client";

import type { JobProfileOpt, SkillOpt } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    <Card>
      <CardContent className="space-y-4 pt-6">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Search</span>
          <Input
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          placeholder="Name, email, role, summary…"
        />
        </label>

      <div>
          <div className="mb-2 text-xs text-muted-foreground">
            Skills (match all selected)
          </div>
          <div className="flex flex-wrap gap-2">
          {skills.length === 0 ? (
              <span className="text-sm text-muted-foreground">No skills indexed yet</span>
          ) : (
            skills.map((s) => (
                <button
                key={s.slug}
                type="button"
                onClick={() => toggleSkill(s.slug)}
                  className="cursor-pointer"
              >
                  <Badge variant={selectedSkills.includes(s.slug) ? "default" : "outline"}>
                    {s.label}
                  </Badge>
                </button>
            ))
          )}
        </div>
      </div>

      <div>
          <div className="mb-2 text-xs text-muted-foreground">Job profile (any match)</div>
          <div className="flex flex-wrap gap-2">
          {jobProfiles.map((p) => (
              <button
              key={p.slug}
              type="button"
              onClick={() => toggleProfile(p.slug)}
                className="cursor-pointer"
            >
                <Badge variant={selectedProfiles.includes(p.slug) ? "default" : "outline"}>
                  {p.label}
                </Badge>
              </button>
          ))}
        </div>
      </div>

        <div>
          <Button type="button" onClick={onApply}>
          Apply filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
