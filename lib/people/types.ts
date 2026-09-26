/**
 * Raw output from a PersonDiscoveryProvider - deliberately NOT the same
 * shape as graph/types.ts's PersonNode. This data is synthesized and
 * unverified (an LLM's read of search results), while PersonNode is what
 * the graph/scoring engine treats as ground truth. Keeping them separate
 * means the graph/scoring code never has to know or care where a person
 * came from.
 */
export interface DiscoveredPerson {
  name: string;
  title: string | null;
  companyName: string | null;
  /** Why this person is relevant to the role, in the model's own words. */
  relationToRole: string;
  /** Must be non-empty - a person with no citation is dropped before this type is ever constructed. */
  sourceUrls: string[];
  /** The model's own confidence estimate, 0-1. */
  confidence: number;
}
