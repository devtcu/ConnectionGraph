import type { CareerGraphFixture, GraphEdge, PersonNode } from "@/lib/graph/types";

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
  requiredSkills: ["Python", "PyTorch", "Distributed Systems"],
  domain: "ML Platform",
};

const company = {
  type: "company" as const,
  id: "company:nimbus-health",
  name: "Nimbus Health",
};

const roles = [
  { type: "role" as const, id: "role:ml-engineer", name: "ML Engineer" },
  { type: "role" as const, id: "role:ml-infra-engineer", name: "ML Infra Engineer" },
  { type: "role" as const, id: "role:data-scientist", name: "Data Scientist" },
  { type: "role" as const, id: "role:eng-manager-ml", name: "Engineering Manager, ML" },
  { type: "role" as const, id: "role:recruiter", name: "Technical Recruiter" },
];

const NIMBUS = company.id;

const people: PersonNode[] = [
  {
    type: "person",
    id: "person:1",
    name: "Priya Nair",
    title: "Senior ML Engineer, ML Platform",
    currentRole: "role:ml-engineer",
    companyId: NIMBUS,
    companyName: "Nimbus Health",
    domain: "ML Platform",
    category: "ic",
    skills: ["Python", "PyTorch", "Distributed Systems", "MLOps"],
  },
  {
    type: "person",
    id: "person:2",
    name: "Marcus Chen",
    title: "ML Infra Engineer",
    currentRole: "role:ml-infra-engineer",
    companyId: NIMBUS,
    companyName: "Nimbus Health",
    domain: "ML Platform",
    category: "ic",
    skills: ["Kubernetes", "Distributed Systems", "MLOps", "Python"],
  },
  {
    type: "person",
    id: "person:3",
    name: "Sofia Reyes",
    title: "Engineering Manager, ML Platform",
    currentRole: "role:eng-manager-ml",
    companyId: NIMBUS,
    companyName: "Nimbus Health",
    domain: "ML Platform",
    category: "manager",
    skills: ["Python", "Distributed Systems", "MLOps"],
  },
  {
    type: "person",
    id: "person:4",
    name: "Rachel Kim",
    title: "Technical Recruiter, ML Platform",
    currentRole: "role:recruiter",
    companyId: NIMBUS,
    companyName: "Nimbus Health",
    domain: "ML Platform",
    category: "recruiter",
    skills: [],
  },
  {
    type: "person",
    id: "person:5",
    name: "Daniel Kim",
    title: "Senior ML Engineer",
    currentRole: "role:ml-engineer",
    companyId: null,
    companyName: "Orbital Data",
    domain: "Data Platform",
    category: "ic",
    skills: ["Python", "PyTorch", "Deep Learning"],
  },
  {
    type: "person",
    id: "person:6",
    name: "Aisha Bello",
    title: "Data Scientist, Risk Modeling",
    currentRole: "role:data-scientist",
    companyId: NIMBUS,
    companyName: "Nimbus Health",
    domain: "Data Science",
    category: "ic",
    skills: ["Python", "SQL", "Deep Learning"],
  },
  {
    type: "person",
    id: "person:7",
    name: "Wei Zhang",
    title: "ML Infra Engineer",
    currentRole: "role:ml-infra-engineer",
    companyId: null,
    companyName: "Orbital Data",
    domain: "Data Platform",
    category: "ic",
    skills: ["Kubernetes", "Distributed Systems"],
  },
  {
    type: "person",
    id: "person:8",
    name: "Tom Bergström",
    title: "ML Engineer",
    currentRole: "role:ml-engineer",
    companyId: null,
    companyName: "Fernway Labs",
    domain: "Product",
    category: "ic",
    skills: ["PyTorch", "Deep Learning", "Data Pipelines"],
  },
  {
    type: "person",
    id: "person:9",
    name: "Lena Fischer",
    title: "Data Scientist",
    currentRole: "role:data-scientist",
    companyId: null,
    companyName: "Fernway Labs",
    domain: "Product Analytics",
    category: "ic",
    skills: ["Python", "SQL"],
  },
  {
    type: "person",
    id: "person:10",
    name: "Carlos Mendez",
    title: "Engineering Manager",
    currentRole: "role:eng-manager-ml",
    companyId: null,
    companyName: "Kestrel Systems",
    domain: "Platform Engineering",
    category: "manager",
    skills: ["Python", "Kubernetes"],
  },
  {
    type: "person",
    id: "person:11",
    name: "Yuki Tanaka",
    title: "ML Engineer",
    currentRole: "role:ml-engineer",
    companyId: null,
    companyName: "Kestrel Systems",
    domain: "Platform Engineering",
    category: "ic",
    skills: ["PyTorch", "MLOps"],
  },
];

function buildEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];
  let n = 0;
  const nextId = (prefix: string) => `edge:${prefix}:${n++}`;

  edges.push({ id: nextId("job-at"), source: job.id, target: company.id, kind: "AT" });
  edges.push({ id: nextId("job-is-a"), source: job.id, target: "role:ml-engineer", kind: "IS_A" });

  for (const role of roles) {
    edges.push({ id: nextId("company-has-role"), source: company.id, target: role.id, kind: "HAS_ROLE" });
  }

  for (const person of people) {
    edges.push({ id: nextId("person-holds-role"), source: person.id, target: person.currentRole, kind: "HOLDS_ROLE" });
    if (person.companyId === company.id) {
      edges.push({ id: nextId("person-works-at"), source: person.id, target: company.id, kind: "WORKS_AT" });
    }
  }

  return edges;
}

export const sampleCareerGraph: CareerGraphFixture = {
  job,
  company,
  roles,
  people,
  edges: buildEdges(),
};
