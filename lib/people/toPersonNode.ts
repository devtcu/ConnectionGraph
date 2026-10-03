import type { PersonCategory, PersonNode, RoleNode } from "@/lib/graph/types";
import type { DiscoveredPerson } from "@/lib/people/types";
import type { JobProfile } from "@/lib/jobs/types";
import { DOMAIN_DICTIONARY, findDictionaryMatches } from "@/lib/jobs/parse/dictionaries";

const RECRUITER_PATTERN = /recruit|talent acqui|sourc(er|ing)/i;
const MANAGER_PATTERN = /\b(manager|director|head of|vp|lead)\b/i;

function inferCategory(title: string | null): PersonCategory {
  if (title && RECRUITER_PATTERN.test(title)) return "recruiter";
  if (title && MANAGER_PATTERN.test(title)) return "manager";
  return "ic";
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "unknown";
}

function sameCompany(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function inferDomain(discovered: DiscoveredPerson, jobProfile: JobProfile): string {
  const text = `${discovered.title ?? ""} ${discovered.relationToRole}`;
  const matches = findDictionaryMatches(text, DOMAIN_DICTIONARY);
  return matches[0] ?? jobProfile.domains[0] ?? "General";
}

interface ToPersonNodeContext {
  companyId: string;
  targetRoleId: string;
  targetTitle: string | null;
  index: number;
}

/**
 * Maps an LLM-discovered person onto the same PersonNode shape the
 * deterministic graph/scoring engine already consumes - this is the one
 * place real-world data meets the fixed vocabulary the scorer expects, and
 * it's genuinely rough in two ways, flagged rather than hidden:
 *
 * - skills: DiscoveredPerson never collects a per-person skill list (only
 *   a free-text "relationToRole"), so this is always []. skillScore will
 *   be 0 for every discovered person until that's collected.
 * - role matching: without a fixed role taxonomy for arbitrary real-world
 *   titles, only an exact title match against the job's own title earns
 *   full roleScore credit - there's no "similar role" partial credit like
 *   the fixture data's ROLE_SIMILARITY table has, since that table is
 *   keyed to specific fixture role ids.
 */
export function toPersonNode(
  discovered: DiscoveredPerson,
  jobProfile: JobProfile,
  context: ToPersonNodeContext,
): { person: PersonNode; role: RoleNode } {
  const normalizedDiscovered = discovered.title?.toLowerCase().trim();
  const normalizedTarget = context.targetTitle?.toLowerCase().trim();
  const isTargetRole = Boolean(normalizedDiscovered && normalizedTarget && normalizedDiscovered === normalizedTarget);

  const role: RoleNode = isTargetRole
    ? { type: "role", id: context.targetRoleId, name: context.targetTitle ?? "Target role" }
    : {
        type: "role",
        id: `role:discovered:${slugify(discovered.title ?? discovered.name)}`,
        name: discovered.title ?? "Unknown role",
      };

  const worksAtTargetCompany = sameCompany(discovered.companyName, jobProfile.company);

  const person: PersonNode = {
    type: "person",
    id: `person:discovered:${context.index}`,
    name: discovered.name,
    title: discovered.title ?? "Unknown title",
    currentRole: role.id,
    companyId: worksAtTargetCompany ? context.companyId : null,
    companyName: discovered.companyName ?? "Unknown company",
    domain: inferDomain(discovered, jobProfile),
    category: inferCategory(discovered.title),
    skills: [],
  };

  return { person, role };
}
