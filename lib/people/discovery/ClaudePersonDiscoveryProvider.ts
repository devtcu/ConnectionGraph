import Anthropic from "@anthropic-ai/sdk";
import type { JobProfile } from "@/lib/jobs/types";
import type { DiscoveredPerson } from "@/lib/people/types";
import type { PersonDiscoveryProvider } from "@/lib/people/discovery/PersonDiscoveryProvider";
import { DiscoveredPeopleSchema } from "@/lib/people/schema";
import { PersonDiscoveryError } from "@/lib/people/errors";

const DEFAULT_MODEL = "claude-sonnet-5";
const MAX_SEARCHES_PER_REQUEST = 5;

const SYSTEM_PROMPT = `You help someone find real people worth reaching out to about a specific job opening. You have a web_search tool - use it.

Priority order for who to look for, highest first:
1. People who currently work at the target company in the same or a closely related team/domain as the job.
2. Recruiters or talent-acquisition people at the target company connected to this team.
3. Engineering managers or team leads at the target company for this domain.
4. People elsewhere (other companies) who are well-known practitioners in this specific technical domain - e.g. they've written, spoken, or are cited publicly about it.

Hard rules:
- Every person you return MUST be backed by at least one real URL from your search results. If you can't find a citable source for someone, drop them - do not include them.
- Never invent a person, a title, or a company. If your searches don't surface real people, return an empty array. An empty array is a correct, honest answer - it is always better than a fabricated one.
- Do not scrape or fetch LinkedIn profile pages directly - only use what appears in search result snippets.

After searching, respond with ONLY a JSON array (no prose, no markdown fences) of up to 10 people, each shaped exactly like:
{
  "name": string,
  "title": string | null,
  "companyName": string | null,
  "relationToRole": string,
  "sourceUrls": string[],
  "confidence": number between 0 and 1
}`;

export function buildDiscoveryPrompt(jobProfile: JobProfile): string {
  const lines = [
    `Target job: ${jobProfile.title ?? "(title unknown)"}`,
    `Company: ${jobProfile.company ?? "(unknown)"}`,
    jobProfile.location ? `Location: ${jobProfile.location}` : null,
    jobProfile.team ? `Team: ${jobProfile.team}` : null,
    jobProfile.domains.length > 0 ? `Domains: ${jobProfile.domains.join(", ")}` : null,
    jobProfile.requiredSkills.length > 0 ? `Required skills: ${jobProfile.requiredSkills.join(", ")}` : null,
    jobProfile.keywords.length > 0 ? `Keywords: ${jobProfile.keywords.join(", ")}` : null,
  ].filter((line): line is string => Boolean(line));

  return `Find people relevant to this job posting:\n\n${lines.join("\n")}`;
}

/** Pulls the model's final JSON answer out of a response that may interleave tool-use/tool-result blocks before it. */
export function extractJsonFromResponse(content: Anthropic.ContentBlock[]): unknown {
  const textBlocks = content.filter((block): block is Anthropic.TextBlock => block.type === "text");
  const lastText = textBlocks.at(-1);
  if (!lastText) {
    throw new PersonDiscoveryError("SEARCH_FAILED", "The model didn't return a text response.");
  }

  const jsonText = lastText.text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  try {
    return JSON.parse(jsonText);
  } catch {
    throw new PersonDiscoveryError("SEARCH_FAILED", "The model's response wasn't valid JSON.");
  }
}

/** Validates + drops anything without a real citation. A candidate failing validation is silently dropped, not a hard error - it's still fine to return the others. */
export function validateDiscoveredPeople(candidate: unknown): DiscoveredPerson[] {
  if (!Array.isArray(candidate)) {
    throw new PersonDiscoveryError("SEARCH_FAILED", "Expected a JSON array of people.");
  }
  const validated: DiscoveredPerson[] = [];
  for (const item of candidate) {
    const result = DiscoveredPeopleSchema.element.safeParse(item);
    if (result.success) validated.push(result.data);
  }
  return validated;
}

export class ClaudePersonDiscoveryProvider implements PersonDiscoveryProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async discoverPeople(jobProfile: JobProfile): Promise<DiscoveredPerson[]> {
    let response;
    try {
      response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: MAX_SEARCHES_PER_REQUEST }],
        messages: [{ role: "user", content: buildDiscoveryPrompt(jobProfile) }],
      });
    } catch (err) {
      throw new PersonDiscoveryError(
        "SEARCH_FAILED",
        err instanceof Error ? `Person search failed: ${err.message}` : "Person search failed.",
      );
    }

    const json = extractJsonFromResponse(response.content);
    return validateDiscoveredPeople(json);
  }
}
