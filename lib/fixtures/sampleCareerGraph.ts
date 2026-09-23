import type { CareerGraphFixture, GraphEdge } from "@/lib/graph/types";

const job = {
  type: "job" as const,
  id: "job:target",
  title: "Senior Machine Learning Engineer",
  seniority: "Senior",
  rawText:
    "We're looking for a Senior Machine Learning Engineer to join the ML Platform " +
    "team at Nimbus Health. You'll build and scale the model-serving infrastructure " +
    "behind our clinical risk-scoring products, working closely with data science " +
    "and product. Strong Python, PyTorch, and distributed-systems experience required.",
};

const company = {
  type: "company" as const,
  id: "company:nimbus-health",
  name: "Nimbus Health",
};

const otherCompanies = [
  { type: "company" as const, id: "company:other-1", name: "Orbital Data" },
  { type: "company" as const, id: "company:other-2", name: "Fernway Labs" },
  { type: "company" as const, id: "company:other-3", name: "Kestrel Systems" },
];

const roles = [
  { type: "role" as const, id: "role:ml-engineer", name: "ML Engineer" },
  { type: "role" as const, id: "role:ml-infra-engineer", name: "ML Infra Engineer" },
  { type: "role" as const, id: "role:data-scientist", name: "Data Scientist" },
  { type: "role" as const, id: "role:eng-manager-ml", name: "Engineering Manager, ML" },
];

const skills = [
  { type: "skill" as const, id: "skill:python", name: "Python" },
  { type: "skill" as const, id: "skill:pytorch", name: "PyTorch" },
  { type: "skill" as const, id: "skill:distributed-systems", name: "Distributed Systems" },
  { type: "skill" as const, id: "skill:kubernetes", name: "Kubernetes" },
  { type: "skill" as const, id: "skill:mlops", name: "MLOps" },
  { type: "skill" as const, id: "skill:deep-learning", name: "Deep Learning" },
  { type: "skill" as const, id: "skill:sql", name: "SQL" },
  { type: "skill" as const, id: "skill:data-pipelines", name: "Data Pipelines" },
];

const people = [
  {
    type: "person" as const,
    id: "person:1",
    name: "Priya Nair",
    title: "Senior ML Engineer, ML Platform",
    currentRole: "role:ml-engineer",
    companyId: "company:nimbus-health",
    skills: ["skill:python", "skill:pytorch", "skill:distributed-systems", "skill:mlops"],
    relevanceScore: 0.97,
  },
  {
    type: "person" as const,
    id: "person:2",
    name: "Marcus Chen",
    title: "ML Infra Engineer",
    currentRole: "role:ml-infra-engineer",
    companyId: "company:nimbus-health",
    skills: ["skill:kubernetes", "skill:distributed-systems", "skill:mlops", "skill:python"],
    relevanceScore: 0.91,
  },
  {
    type: "person" as const,
    id: "person:3",
    name: "Sofia Reyes",
    title: "Engineering Manager, ML Platform",
    currentRole: "role:eng-manager-ml",
    companyId: "company:nimbus-health",
    skills: ["skill:python", "skill:distributed-systems", "skill:mlops"],
    relevanceScore: 0.88,
  },
  {
    type: "person" as const,
    id: "person:4",
    name: "Daniel Kim",
    title: "Senior ML Engineer",
    currentRole: "role:ml-engineer",
    companyId: "company:other-1",
    skills: ["skill:python", "skill:pytorch", "skill:deep-learning"],
    relevanceScore: 0.79,
  },
  {
    type: "person" as const,
    id: "person:5",
    name: "Aisha Bello",
    title: "Data Scientist, Risk Modeling",
    currentRole: "role:data-scientist",
    companyId: "company:nimbus-health",
    skills: ["skill:python", "skill:sql", "skill:deep-learning"],
    relevanceScore: 0.74,
  },
  {
    type: "person" as const,
    id: "person:6",
    name: "Tom Bergström",
    title: "ML Engineer",
    currentRole: "role:ml-engineer",
    companyId: "company:other-2",
    skills: ["skill:pytorch", "skill:deep-learning", "skill:data-pipelines"],
    relevanceScore: 0.68,
  },
  {
    type: "person" as const,
    id: "person:7",
    name: "Wei Zhang",
    title: "Data Pipeline Engineer",
    currentRole: "role:ml-infra-engineer",
    companyId: "company:other-1",
    skills: ["skill:data-pipelines", "skill:sql", "skill:kubernetes"],
    relevanceScore: 0.61,
  },
  {
    type: "person" as const,
    id: "person:8",
    name: "Lena Fischer",
    title: "Data Scientist",
    currentRole: "role:data-scientist",
    companyId: "company:other-2",
    skills: ["skill:python", "skill:sql"],
    relevanceScore: 0.52,
  },
  {
    type: "person" as const,
    id: "person:9",
    name: "Carlos Mendez",
    title: "Engineering Manager",
    currentRole: "role:eng-manager-ml",
    companyId: "company:other-3",
    skills: ["skill:python", "skill:kubernetes"],
    relevanceScore: 0.47,
  },
  {
    type: "person" as const,
    id: "person:10",
    name: "Yuki Tanaka",
    title: "ML Engineer",
    currentRole: "role:ml-engineer",
    companyId: "company:other-3",
    skills: ["skill:pytorch", "skill:mlops"],
    relevanceScore: 0.58,
  },
];

const roleSkillMap: Record<string, string[]> = {
  "role:ml-engineer": ["skill:python", "skill:pytorch", "skill:deep-learning"],
  "role:ml-infra-engineer": ["skill:kubernetes", "skill:distributed-systems", "skill:mlops"],
  "role:data-scientist": ["skill:python", "skill:sql", "skill:deep-learning"],
  "role:eng-manager-ml": ["skill:python", "skill:distributed-systems"],
};

const jobRequiredSkills = ["skill:python", "skill:pytorch", "skill:distributed-systems"];

function buildEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];
  let n = 0;
  const nextId = (prefix: string) => `edge:${prefix}:${n++}`;

  edges.push({ id: nextId("job-at"), source: job.id, target: company.id, kind: "AT" });
  edges.push({ id: nextId("job-is-a"), source: job.id, target: "role:ml-engineer", kind: "IS_A" });

  for (const skillId of jobRequiredSkills) {
    edges.push({ id: nextId("job-requires"), source: job.id, target: skillId, kind: "REQUIRES" });
  }

  for (const role of roles) {
    edges.push({ id: nextId("company-has-role"), source: company.id, target: role.id, kind: "HAS_ROLE" });
    for (const skillId of roleSkillMap[role.id] ?? []) {
      edges.push({ id: nextId("role-requires"), source: role.id, target: skillId, kind: "REQUIRES" });
    }
  }

  for (const person of people) {
    edges.push({ id: nextId("person-holds-role"), source: person.id, target: person.currentRole, kind: "HOLDS_ROLE" });
    edges.push({ id: nextId("person-works-at"), source: person.id, target: person.companyId, kind: "WORKS_AT" });
    for (const skillId of person.skills) {
      edges.push({ id: nextId("person-has-skill"), source: person.id, target: skillId, kind: "HAS_SKILL" });
    }
    edges.push({
      id: nextId("person-relevant-to"),
      source: person.id,
      target: job.id,
      kind: "RELEVANT_TO",
      weight: person.relevanceScore,
    });
  }

  return edges;
}

export const sampleCareerGraph: CareerGraphFixture = {
  job,
  company,
  otherCompanies,
  roles,
  skills,
  people,
  edges: buildEdges(),
};
