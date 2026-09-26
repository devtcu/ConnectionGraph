import { describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import {
  buildDiscoveryPrompt,
  extractJsonFromResponse,
  validateDiscoveredPeople,
} from "@/lib/people/discovery/ClaudePersonDiscoveryProvider";
import { PersonDiscoveryError } from "@/lib/people/errors";
import type { JobProfile } from "@/lib/jobs/types";

const SAMPLE_JOB: JobProfile = {
  id: "job:1",
  sourceUrl: null,
  company: "Nimbus Health",
  title: "Senior ML Engineer",
  location: "San Francisco, CA",
  employmentType: "Full-time",
  seniority: "Senior",
  team: "ML Platform",
  domains: ["ML Platform", "Machine Learning"],
  requiredSkills: ["Python", "PyTorch"],
  preferredSkills: [],
  responsibilities: [],
  keywords: ["Python", "PyTorch", "ML Platform"],
};

function textBlock(text: string): Anthropic.TextBlock {
  return { type: "text", text, citations: null };
}

describe("buildDiscoveryPrompt", () => {
  it("includes the job's key fields", () => {
    const prompt = buildDiscoveryPrompt(SAMPLE_JOB);
    expect(prompt).toContain("Nimbus Health");
    expect(prompt).toContain("Senior ML Engineer");
    expect(prompt).toContain("ML Platform");
    expect(prompt).toContain("Python, PyTorch");
  });

  it("omits empty fields rather than printing them blank", () => {
    const minimal: JobProfile = { ...SAMPLE_JOB, team: null, domains: [], preferredSkills: [] };
    const prompt = buildDiscoveryPrompt(minimal);
    expect(prompt).not.toContain("Team:");
    expect(prompt).not.toContain("Domains:");
  });
});

describe("extractJsonFromResponse", () => {
  it("parses a plain JSON text block", () => {
    const result = extractJsonFromResponse([textBlock('[{"name":"Ada Lovelace"}]')]);
    expect(result).toEqual([{ name: "Ada Lovelace" }]);
  });

  it("strips markdown code fences", () => {
    const result = extractJsonFromResponse([textBlock('```json\n[{"name":"Ada"}]\n```')]);
    expect(result).toEqual([{ name: "Ada" }]);
  });

  it("uses the last text block when tool-use blocks came before it", () => {
    const toolUse = { type: "server_tool_use", id: "x", name: "web_search", input: {} } as unknown as Anthropic.ContentBlock;
    const result = extractJsonFromResponse([toolUse, textBlock("[]")]);
    expect(result).toEqual([]);
  });

  it("throws SEARCH_FAILED on invalid JSON", () => {
    expect(() => extractJsonFromResponse([textBlock("not json")])).toThrow(PersonDiscoveryError);
  });

  it("throws SEARCH_FAILED when there's no text block at all", () => {
    const toolUse = { type: "server_tool_use", id: "x", name: "web_search", input: {} } as unknown as Anthropic.ContentBlock;
    expect(() => extractJsonFromResponse([toolUse])).toThrow(PersonDiscoveryError);
  });
});

describe("validateDiscoveredPeople", () => {
  it("keeps well-formed candidates with a source URL", () => {
    const result = validateDiscoveredPeople([
      {
        name: "Priya Nair",
        title: "Senior ML Engineer",
        companyName: "Nimbus Health",
        relationToRole: "Works on the exact team",
        sourceUrls: ["https://example.com/priya"],
        confidence: 0.9,
      },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Priya Nair");
  });

  it("drops candidates with no source URL - this is what stops hallucinated people from reaching the UI", () => {
    const result = validateDiscoveredPeople([
      { name: "Fabricated Person", sourceUrls: [], confidence: 0.9 },
      { name: "Real Person", sourceUrls: ["https://example.com/real"], confidence: 0.7 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Real Person");
  });

  it("drops candidates missing a name entirely", () => {
    const result = validateDiscoveredPeople([{ sourceUrls: ["https://example.com"] }]);
    expect(result).toHaveLength(0);
  });

  it("throws SEARCH_FAILED when the top-level shape isn't an array", () => {
    expect(() => validateDiscoveredPeople({ not: "an array" })).toThrow(PersonDiscoveryError);
  });
});
