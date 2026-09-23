export type NodeId = string;

export type PersonCategory = "ic" | "manager" | "recruiter";

export interface JobNode {
  type: "job";
  id: NodeId;
  title: string;
  seniority: string;
  rawText: string;
  requiredSkills: string[];
  domain: string;
}

export interface CompanyNode {
  type: "company";
  id: NodeId;
  name: string;
}

export interface RoleNode {
  type: "role";
  id: NodeId;
  name: string;
}

export interface PersonNode {
  type: "person";
  id: NodeId;
  name: string;
  title: string;
  currentRole: NodeId; // -> RoleNode
  /** Target company's node id if this person works there, else null (person still exists on the graph - they just aren't linked to a company node). */
  companyId: NodeId | null;
  /** Always present, for display, regardless of whether companyId is set. */
  companyName: string;
  /** Functional team/domain tag (e.g. "ML Platform"), independent of role. */
  domain: string;
  category: PersonCategory;
  skills: string[];
}

export type GraphNode = JobNode | CompanyNode | RoleNode | PersonNode;

export type EdgeKind = "AT" | "IS_A" | "HAS_ROLE" | "HOLDS_ROLE" | "WORKS_AT";

export interface GraphEdge {
  id: NodeId;
  source: NodeId;
  target: NodeId;
  kind: EdgeKind;
}

export interface CareerGraphFixture {
  job: JobNode;
  company: CompanyNode;
  roles: RoleNode[];
  people: PersonNode[];
  edges: GraphEdge[];
}
