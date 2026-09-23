export type NodeId = string;

export interface JobNode {
  type: "job";
  id: NodeId;
  title: string;
  seniority: string;
  rawText: string;
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

export interface SkillNode {
  type: "skill";
  id: NodeId;
  name: string;
}

export interface PersonNode {
  type: "person";
  id: NodeId;
  name: string;
  title: string;
  currentRole: NodeId; // -> RoleNode
  companyId: NodeId; // -> CompanyNode
  skills: NodeId[]; // -> SkillNode[]
  /**
   * Placeholder for the future ranking algorithm's output. In v0.1 this is
   * hand-assigned per fixture person; later it's computed from graph
   * structure (shared skills/role/company distance) and reflects how good
   * an outreach target this person is for the target job.
   */
  relevanceScore: number; // 0-1
}

export type GraphNode = JobNode | CompanyNode | RoleNode | SkillNode | PersonNode;

export type EdgeKind =
  | "REQUIRES"
  | "AT"
  | "IS_A"
  | "HAS_ROLE"
  | "HAS_SKILL"
  | "HOLDS_ROLE"
  | "WORKS_AT"
  | "RELEVANT_TO";

export interface GraphEdge {
  id: NodeId;
  source: NodeId;
  target: NodeId;
  kind: EdgeKind;
  weight?: number;
}

export interface CareerGraphFixture {
  job: JobNode;
  /** The hiring company the target job belongs to. */
  company: CompanyNode;
  /**
   * Employers of relevant people who *don't* work at the target company
   * (e.g. informational-interview or industry contacts). Kept separate from
   * `company` because the job/role/skill subgraph is anchored to one
   * company, while people can come from anywhere.
   */
  otherCompanies: CompanyNode[];
  roles: RoleNode[];
  skills: SkillNode[];
  people: PersonNode[];
  edges: GraphEdge[];
}
