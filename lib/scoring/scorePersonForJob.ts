import type Graph from "graphology";
import type { GraphNode, JobNode, PersonNode } from "@/lib/graph/types";
import type { PersonRelevanceScore } from "@/lib/scoring/types";

/**
 * Structural signals (company + role + domain = 0.60) deliberately outweigh
 * skill overlap (0.15) - sharing "Python" with the job should never be
 * enough on its own to rank someone highly. recruiterOrManagerScore is
 * split out from roleScore because a recruiter/manager tied to this domain
 * can be a top-tier contact independent of whether they share the job's
 * day-to-day skills. graphProximityScore gets the smallest weight since
 * it's mostly a byproduct of the signals above, not an independent one.
 */
export const WEIGHTS = {
  company: 0.25,
  role: 0.2,
  domain: 0.15,
  skill: 0.15,
  graphProximity: 0.1,
  recruiterOrManager: 0.15,
} as const;

/** Roles that aren't identical but are close enough to earn partial credit. Symmetric, unordered pairs. */
const ROLE_SIMILARITY: [string, string, number][] = [["role:ml-engineer", "role:ml-infra-engineer", 0.5]];

function roleSimilarity(roleA: string, roleB: string): number {
  if (roleA === roleB) return 1;
  for (const [a, b, score] of ROLE_SIMILARITY) {
    if ((roleA === a && roleB === b) || (roleA === b && roleB === a)) return score;
  }
  return 0;
}

/** Hop-distance decay: closer to the job structurally is worth more, but it tapers off quickly. */
function proximityFromDistance(distance: number | null): number {
  if (distance === null) return 0;
  if (distance <= 1) return 1;
  if (distance === 2) return 0.8;
  if (distance === 3) return 0.5;
  if (distance === 4) return 0.25;
  return 0.1;
}

/** Unweighted BFS shortest-path distance between two nodes, treating all edges as undirected. */
function graphDistance(graph: Graph, fromId: string, toId: string): number | null {
  if (fromId === toId) return 0;
  const visited = new Set<string>([fromId]);
  let frontier = [fromId];
  let distance = 0;

  while (frontier.length > 0) {
    distance += 1;
    const next: string[] = [];
    for (const nodeId of frontier) {
      for (const edge of graph.edges(nodeId)) {
        const neighbor = graph.opposite(nodeId, edge);
        if (visited.has(neighbor)) continue;
        if (neighbor === toId) return distance;
        visited.add(neighbor);
        next.push(neighbor);
      }
    }
    frontier = next;
  }

  return null;
}

function computeSkillScore(person: PersonNode, job: JobNode): { score: number; matched: string[] } {
  if (job.requiredSkills.length === 0) return { score: 0, matched: [] };
  const personSkills = new Set(person.skills);
  const matched = job.requiredSkills.filter((skill) => personSkills.has(skill));
  return { score: matched.length / job.requiredSkills.length, matched };
}

function computeRecruiterOrManagerScore(person: PersonNode, job: JobNode): number {
  const sameDomain = person.domain === job.domain;
  if (person.category === "recruiter") return sameDomain ? 1 : 0.5;
  if (person.category === "manager") return sameDomain ? 1 : 0.4;
  return 0;
}

export function scorePersonForJob(graph: Graph, personId: string, targetJobId: string): PersonRelevanceScore {
  const person = graph.getNodeAttributes(personId).data as GraphNode;
  const job = graph.getNodeAttributes(targetJobId).data as GraphNode;
  if (person.type !== "person") throw new Error(`Node ${personId} is not a person`);
  if (job.type !== "job") throw new Error(`Node ${targetJobId} is not a job`);

  const reasons: string[] = [];

  const targetCompanyId = getJobTargetCompany(graph, targetJobId);
  const worksAtTargetCompany = person.companyId !== null && person.companyId === targetCompanyId;
  const resolvedCompanyScore = worksAtTargetCompany ? 1 : 0;
  if (worksAtTargetCompany) reasons.push(`Works at ${person.companyName} (the hiring company)`);

  const targetRoleId = getJobTargetRole(graph, targetJobId);
  const resolvedRoleScore = roleSimilarity(person.currentRole, targetRoleId);
  if (resolvedRoleScore === 1) {
    reasons.push(`Holds the exact target role`);
  } else if (resolvedRoleScore > 0) {
    reasons.push(`Holds a closely related role`);
  }

  const sameDomain = person.domain === job.domain;
  const domainScore = sameDomain ? 1 : 0;
  if (sameDomain) reasons.push(`Same team/domain: ${person.domain}`);

  const { score: skillScoreValue, matched } = computeSkillScore(person, job);
  if (matched.length > 0) {
    reasons.push(`Shares ${matched.length}/${job.requiredSkills.length} required skills (${matched.join(", ")})`);
  }

  const distance = graphDistance(graph, personId, targetJobId);
  const graphProximityScore = proximityFromDistance(distance);

  const recruiterOrManagerScore = computeRecruiterOrManagerScore(person, job);
  if (person.category === "recruiter" && recruiterOrManagerScore > 0) {
    reasons.push(sameDomain ? "Recruiter dedicated to this team" : "Recruiter, different team");
  }
  if (person.category === "manager" && recruiterOrManagerScore > 0) {
    reasons.push(sameDomain ? "Manager/team-lead for this team" : "Manager in a related area");
  }

  const totalScore =
    WEIGHTS.company * resolvedCompanyScore +
    WEIGHTS.role * resolvedRoleScore +
    WEIGHTS.domain * domainScore +
    WEIGHTS.skill * skillScoreValue +
    WEIGHTS.graphProximity * graphProximityScore +
    WEIGHTS.recruiterOrManager * recruiterOrManagerScore;

  return {
    personId,
    totalScore,
    companyScore: resolvedCompanyScore,
    roleScore: resolvedRoleScore,
    skillScore: skillScoreValue,
    domainScore,
    graphProximityScore,
    recruiterOrManagerScore,
    reasons,
  };
}

function getJobTargetRole(graph: Graph, targetJobId: string): string {
  const roleEdge = graph.outEdges(targetJobId).find((edge) => graph.getEdgeAttribute(edge, "kind") === "IS_A");
  return roleEdge ? graph.opposite(targetJobId, roleEdge) : "";
}

function getJobTargetCompany(graph: Graph, targetJobId: string): string {
  const companyEdge = graph.outEdges(targetJobId).find((edge) => graph.getEdgeAttribute(edge, "kind") === "AT");
  return companyEdge ? graph.opposite(targetJobId, companyEdge) : "";
}

/** Whichever weighted component contributed the most to the total - used for the "strongest connection" UI. */
export function getStrongestConnectionLabel(score: PersonRelevanceScore): string {
  const contributions: { label: string; value: number }[] = [
    { label: "Works at the hiring company", value: WEIGHTS.company * score.companyScore },
    { label: "Role match with the target job", value: WEIGHTS.role * score.roleScore },
    { label: "Same team/domain as the job", value: WEIGHTS.domain * score.domainScore },
    { label: "Shared required skills", value: WEIGHTS.skill * score.skillScore },
    { label: "Close in the org graph", value: WEIGHTS.graphProximity * score.graphProximityScore },
    { label: "Recruiter/manager for this team", value: WEIGHTS.recruiterOrManager * score.recruiterOrManagerScore },
  ];
  const top = contributions.reduce((best, c) => (c.value > best.value ? c : best));
  return top.value > 0 ? top.label : "No strong connection found";
}

export function rankPeopleForJob(graph: Graph, targetJobId: string): PersonRelevanceScore[] {
  const scores: PersonRelevanceScore[] = [];
  graph.forEachNode((nodeId, attrs) => {
    const node = attrs.data as GraphNode;
    if (node.type === "person") {
      scores.push(scorePersonForJob(graph, nodeId, targetJobId));
    }
  });
  return scores.sort((a, b) => b.totalScore - a.totalScore);
}
