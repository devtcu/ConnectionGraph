import type { PersonDiscoveryProvider } from "@/lib/people/discovery/PersonDiscoveryProvider";
import { ClaudePersonDiscoveryProvider } from "@/lib/people/discovery/ClaudePersonDiscoveryProvider";
import { PersonDiscoveryError } from "@/lib/people/errors";

/**
 * Server-only, same as getJobTextParser. Unlike job parsing, there's no
 * heuristic fallback for finding real people on the internet - if no key is
 * configured, discovery is simply unavailable, and callers get a clear
 * NOT_CONFIGURED error rather than fabricated results.
 */
export function getPersonDiscoveryProvider(): PersonDiscoveryProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new PersonDiscoveryError(
      "NOT_CONFIGURED",
      "Person discovery requires ANTHROPIC_API_KEY to be set on the server.",
    );
  }
  return new ClaudePersonDiscoveryProvider(apiKey, process.env.ANTHROPIC_MODEL);
}
