import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";
import type { JobTextParser } from "@/lib/jobs/parse/JobTextParser";
import type { JobProfile } from "@/lib/jobs/types";
import { JobIngestionError } from "@/lib/jobs/errors";
import { JobProfileSchema } from "@/lib/jobs/schema";

const DEFAULT_MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT = `You extract structured data from job postings. Read the job text and output ONLY a JSON object (no prose, no markdown fences) with exactly these fields:

{
  "company": string | null,
  "title": string | null,
  "location": string | null,
  "employmentType": string | null,
  "seniority": string | null,
  "team": string | null,
  "domains": string[],
  "requiredSkills": string[],
  "preferredSkills": string[],
  "responsibilities": string[],
  "keywords": string[]
}

Rules:
- Only use information explicitly present in the text. Never guess or invent a value.
- If a field isn't stated in the posting, use null (for strings) or [] (for arrays). Do not omit fields.
- requiredSkills and preferredSkills must come from the posting's actual requirements sections, not general assumptions about the role.`;

/**
 * This is where a real LLM call belongs: this class is fully wired and
 * correct, it's just never instantiated unless ANTHROPIC_API_KEY is set
 * (see getJobTextParser.ts) - so the app runs today on the heuristic parser
 * with zero credentials, and flipping to Claude later is a one-line env
 * var, not a code change.
 */
export class AnthropicJobTextParser implements JobTextParser {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async parse(text: string, sourceUrl: string | null): Promise<JobProfile> {
    let response;
    try {
      response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      });
    } catch {
      throw new JobIngestionError("PARSE_FAILED", "The job parser is temporarily unavailable.");
    }

    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new JobIngestionError("PARSE_FAILED", "The job parser returned an empty response.");
    }

    let parsedJson: unknown;
    try {
      const jsonText = block.text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      parsedJson = JSON.parse(jsonText);
    } catch {
      throw new JobIngestionError("PARSE_FAILED", "The job parser returned output that wasn't valid JSON.");
    }

    const candidate = { id: randomUUID(), sourceUrl, ...(parsedJson as Record<string, unknown>) };
    const result = JobProfileSchema.safeParse(candidate);
    if (!result.success) {
      throw new JobIngestionError("PARSE_FAILED", "The job parser's output didn't match the expected shape.");
    }
    return result.data;
  }
}
