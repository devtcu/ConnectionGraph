import type { JobProfile } from "@/lib/jobs/types";
import type { DiscoveredPerson } from "@/lib/people/types";

/**
 * Unlike JobTextParser, there's no offline/heuristic fallback here - finding
 * real people on the internet genuinely requires a search-capable model.
 * The interface still exists so a different provider (a different LLM, a
 * different search backend) can be swapped in later without touching the
 * API route or the UI.
 */
export interface PersonDiscoveryProvider {
  discoverPeople(jobProfile: JobProfile): Promise<DiscoveredPerson[]>;
}
