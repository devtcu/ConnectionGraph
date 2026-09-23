import { z } from "zod";

/**
 * Single source of truth for what a JobProfile is allowed to look like,
 * used to validate output from ANY parser (heuristic today, an LLM later)
 * before it's trusted. Every field defaults to null/[] rather than failing
 * the whole parse - per the "never invent, unknown fields are empty"
 * requirement, a missing field is a legitimate empty result, not an error.
 */
export const JobProfileSchema = z.object({
  id: z.string(),
  sourceUrl: z.string().nullable().default(null),
  company: z.string().nullable().default(null),
  title: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  employmentType: z.string().nullable().default(null),
  seniority: z.string().nullable().default(null),
  team: z.string().nullable().default(null),
  domains: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export type ValidatedJobProfile = z.infer<typeof JobProfileSchema>;

/** Throws JobIngestionError("PARSE_FAILED") indirectly via the caller if the shape is unusable (not even an object). */
export function parseJobProfile(candidate: unknown) {
  return JobProfileSchema.safeParse(candidate);
}
