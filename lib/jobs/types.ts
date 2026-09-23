export type JobInputMode = "url" | "text";

export interface JobProfile {
  id: string;
  sourceUrl: string | null;
  company: string | null;
  title: string | null;
  location: string | null;
  employmentType: string | null;
  seniority: string | null;
  team: string | null;
  domains: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  keywords: string[];
}
