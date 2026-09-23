import type { JobProfile } from "@/lib/jobs/types";

/**
 * Provider-agnostic: turns raw job text into a JobProfile. The heuristic
 * implementation needs no credentials and runs today; an LLM-backed
 * implementation (see AnthropicJobTextParser) can be swapped in later
 * without any caller change, since both return the same validated shape.
 */
export interface JobTextParser {
  parse(text: string, sourceUrl: string | null): Promise<JobProfile>;
}
