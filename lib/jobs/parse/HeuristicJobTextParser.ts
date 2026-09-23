import { randomUUID } from "node:crypto";
import type { JobTextParser } from "@/lib/jobs/parse/JobTextParser";
import type { JobProfile } from "@/lib/jobs/types";
import { JobIngestionError } from "@/lib/jobs/errors";
import { JobProfileSchema } from "@/lib/jobs/schema";
import {
  DOMAIN_DICTIONARY,
  EMPLOYMENT_TYPES,
  SENIORITY_LEVELS,
  SKILL_DICTIONARY,
  findDictionaryMatches,
} from "@/lib/jobs/parse/dictionaries";

const REQUIRED_SECTION_HEADERS = /(required|minimum|must[- ]have)\s+(qualifications|skills|requirements)/i;
const PREFERRED_SECTION_HEADERS = /(preferred|nice[- ]to[- ]have|bonus)\s*(qualifications|skills)?/i;
const RESPONSIBILITIES_HEADERS = /(responsibilities|what you.?ll do|key duties)/i;
const LABEL_PATTERNS: Record<string, RegExp> = {
  title: /(?:job\s*)?title\s*:\s*(.+)/i,
  company: /company\s*:\s*(.+)/i,
  location: /location\s*:\s*(.+)/i,
  team: /team\s*:\s*(.+)/i,
};
const BULLET_LINE = /^\s*(?:[-*•]|\d+[.)])\s+(.+)$/;

/** Splits text into rough sections by scanning for known headers, so we can tell "required" from "preferred" skills. */
function splitSections(text: string): { required: string; preferred: string; responsibilities: string; rest: string } {
  const lines = text.split(/\r?\n/);
  const sections = { required: "", preferred: "", responsibilities: "", rest: "" };
  let current: keyof typeof sections = "rest";

  for (const line of lines) {
    if (REQUIRED_SECTION_HEADERS.test(line)) {
      current = "required";
      continue;
    }
    if (PREFERRED_SECTION_HEADERS.test(line)) {
      current = "preferred";
      continue;
    }
    if (RESPONSIBILITIES_HEADERS.test(line)) {
      current = "responsibilities";
      continue;
    }
    sections[current] += line + "\n";
  }

  return sections;
}

function extractLabeled(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match ? match[1].trim().split(/[\n.]/)[0].trim() : null;
}

function guessTitle(text: string): string | null {
  const labeled = extractLabeled(text, LABEL_PATTERNS.title);
  if (labeled) return labeled;

  const firstLine = text.split(/\r?\n/).map((l) => l.trim()).find((l) => l.length > 0);
  if (firstLine && firstLine.length < 80 && !firstLine.endsWith(".")) return firstLine;
  return null;
}

function guessLocation(text: string): string | null {
  const labeled = extractLabeled(text, LABEL_PATTERNS.location);
  if (labeled) return labeled;

  if (/\bremote\b/i.test(text)) return "Remote";
  const cityState = text.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s([A-Z]{2})\b/);
  return cityState ? `${cityState[1]}, ${cityState[2]}` : null;
}

function guessEmploymentType(text: string): string | null {
  return EMPLOYMENT_TYPES.find((type) => new RegExp(`\\b${type}\\b`, "i").test(text)) ?? null;
}

function guessSeniority(text: string): string | null {
  return SENIORITY_LEVELS.find((level) => new RegExp(`\\b${level}\\b`, "i").test(text)) ?? null;
}

function extractResponsibilities(section: string): string[] {
  return section
    .split(/\r?\n/)
    .map((line) => line.match(BULLET_LINE)?.[1].trim())
    .filter((line): line is string => Boolean(line));
}

export class HeuristicJobTextParser implements JobTextParser {
  async parse(text: string, sourceUrl: string | null): Promise<JobProfile> {
    const sections = splitSections(text);
    const requiredSkills = findDictionaryMatches(sections.required || text, SKILL_DICTIONARY);
    const preferredSkills = findDictionaryMatches(sections.preferred, SKILL_DICTIONARY).filter(
      (skill) => !requiredSkills.includes(skill),
    );
    const domains = findDictionaryMatches(text, DOMAIN_DICTIONARY);
    const responsibilities = extractResponsibilities(sections.responsibilities);

    const candidate = {
      id: randomUUID(),
      sourceUrl,
      company: extractLabeled(text, LABEL_PATTERNS.company),
      title: guessTitle(text),
      location: guessLocation(text),
      employmentType: guessEmploymentType(text),
      seniority: guessSeniority(text),
      team: extractLabeled(text, LABEL_PATTERNS.team),
      domains,
      requiredSkills,
      preferredSkills,
      responsibilities,
      keywords: Array.from(new Set([...requiredSkills, ...preferredSkills, ...domains])),
    };

    const result = JobProfileSchema.safeParse(candidate);
    if (!result.success) {
      throw new JobIngestionError("PARSE_FAILED", "Couldn't extract a structured job profile from this text.");
    }
    return result.data;
  }
}
