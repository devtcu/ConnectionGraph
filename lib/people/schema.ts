import { z } from "zod";

/**
 * A candidate with no source URL is worthless for outreach (you can't
 * verify or act on it) and is exactly the kind of thing an LLM can
 * hallucinate with total confidence - so sourceUrls is required and
 * non-empty here, unlike JobProfile's fields which default to empty.
 */
export const DiscoveredPersonSchema = z.object({
  name: z.string().min(1),
  title: z.string().nullable().default(null),
  companyName: z.string().nullable().default(null),
  relationToRole: z.string().default(""),
  sourceUrls: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1).default(0.5),
});

export const DiscoveredPeopleSchema = z.array(DiscoveredPersonSchema);
