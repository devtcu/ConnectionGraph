import type { JobTextParser } from "@/lib/jobs/parse/JobTextParser";
import { HeuristicJobTextParser } from "@/lib/jobs/parse/HeuristicJobTextParser";
import { AnthropicJobTextParser } from "@/lib/jobs/parse/AnthropicJobTextParser";

/**
 * Server-only. ANTHROPIC_API_KEY (no NEXT_PUBLIC_ prefix) is never bundled
 * to the client by Next.js - this function only ever runs inside the API
 * route, so the key never leaves the server.
 */
export function getJobTextParser(): JobTextParser {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    return new AnthropicJobTextParser(apiKey, process.env.ANTHROPIC_MODEL);
  }
  return new HeuristicJobTextParser();
}
