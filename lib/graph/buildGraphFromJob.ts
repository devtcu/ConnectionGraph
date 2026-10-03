import type { CareerGraphFixture, CompanyNode, GraphEdge, JobNode, RoleNode } from "@/lib/graph/types";
import type { JobProfile } from "@/lib/jobs/types";
import type { DiscoveredPerson } from "@/lib/people/types";
import { toPersonNode } from "@/lib/people/toPersonNode";

const TARGET_COMPANY_ID = "company:target";
const TARGET_ROLE_ID = "role:target";
const TARGET_JOB_ID = "job:target";

/**
 * Turns a parsed JobProfile + discovered people into the same
 * CareerGraphFixture shape the fixture-based graph already uses, so
 * buildGraph/applyLayout/scorePersonForJob/GraphView stay completely
 * unchanged - only the data source differs.
 */
export function buildGraphFromJob(jobProfile: JobProfile, discoveredPeople: DiscoveredPerson[]): CareerGraphFixture {
  const company: CompanyNode = {
    type: "company",
    id: TARGET_COMPANY_ID,
    name: jobProfile.company ?? "Unknown company",
  };

  const targetRole: RoleNode = {
    type: "role",
    id: TARGET_ROLE_ID,
    name: jobProfile.title ?? "Target role",
  };

  const job: JobNode = {
    type: "job",
    id: TARGET_JOB_ID,
    title: jobProfile.title ?? "Untitled role",
    seniority: jobProfile.seniority ?? "",
    rawText: jobProfile.responsibilities.join(" ") || jobProfile.title || "",
    requiredSkills: jobProfile.requiredSkills,
    domain: jobProfile.domains[0] ?? "General",
  };

  const rolesById = new Map<string, RoleNode>([[targetRole.id, targetRole]]);
  const people = discoveredPeople.map((discovered, index) => {
    const { person, role } = toPersonNode(discovered, jobProfile, {
      companyId: company.id,
      targetRoleId: targetRole.id,
      targetTitle: jobProfile.title,
      index,
    });
    if (!rolesById.has(role.id)) rolesById.set(role.id, role);
    return person;
  });

  const roles = Array.from(rolesById.values());

  const edges: GraphEdge[] = [];
  let n = 0;
  const nextId = (prefix: string) => `edge:${prefix}:${n++}`;

  edges.push({ id: nextId("job-at"), source: job.id, target: company.id, kind: "AT" });
  edges.push({ id: nextId("job-is-a"), source: job.id, target: targetRole.id, kind: "IS_A" });

  for (const role of roles) {
    edges.push({ id: nextId("company-has-role"), source: company.id, target: role.id, kind: "HAS_ROLE" });
  }

  for (const person of people) {
    edges.push({ id: nextId("person-holds-role"), source: person.id, target: person.currentRole, kind: "HOLDS_ROLE" });
    if (person.companyId === company.id) {
      edges.push({ id: nextId("person-works-at"), source: person.id, target: company.id, kind: "WORKS_AT" });
    }
  }

  return { job, company, roles, people, edges };
}
