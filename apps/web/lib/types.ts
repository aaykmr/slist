export type JobProfileOpt = { slug: string; label: string };
export type SkillOpt = { slug: string; label: string };

export type CandidateRow = {
  id: string;
  displayName: string | null;
  email: string | null;
  location: string | null;
  seniority: string | null;
  yearsExperience: number | null;
  primaryRole: string | null;
  summary: string | null;
  skills: SkillOpt[];
  jobProfiles: JobProfileOpt[];
  updatedAt: string;
};

export type CandidateListResponse = {
  items: CandidateRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type ParseJobResponse = {
  id: string;
  status: string;
  originalName: string | null;
  errorMessage: string | null;
  candidate: { id: string; displayName: string | null } | null;
};
