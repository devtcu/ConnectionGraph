export interface PersonRelevanceScore {
  personId: string;
  totalScore: number;
  companyScore: number;
  roleScore: number;
  skillScore: number;
  domainScore: number;
  graphProximityScore: number;
  recruiterOrManagerScore: number;
  /** Human-readable explanations, one per component that meaningfully contributed. */
  reasons: string[];
}
