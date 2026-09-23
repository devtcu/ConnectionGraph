import { describe, expect, it, beforeAll } from "vitest";
import type Graph from "graphology";
import { buildGraph } from "@/lib/graph/buildGraph";
import { sampleCareerGraph } from "@/lib/fixtures/sampleCareerGraph";
import { rankPeopleForJob, scorePersonForJob, WEIGHTS } from "@/lib/scoring/scorePersonForJob";

describe("scorePersonForJob", () => {
  let graph: Graph;
  const jobId = sampleCareerGraph.job.id;

  beforeAll(() => {
    // Layout isn't needed for scoring - it only affects x/y, not graph structure.
    graph = buildGraph(sampleCareerGraph);
  });

  it("ranks an exact-team person highly", () => {
    // Priya Nair: same company, exact role, exact domain, full skill match.
    const score = scorePersonForJob(graph, "person:1", jobId);
    expect(score.totalScore).toBeGreaterThan(0.7);
    expect(score.companyScore).toBe(1);
    expect(score.roleScore).toBe(1);
    expect(score.domainScore).toBe(1);
  });

  it("ranks a domain-relevant recruiter reasonably highly", () => {
    // Rachel Kim: recruiter dedicated to the job's own domain, no skills at all.
    const score = scorePersonForJob(graph, "person:4", jobId);
    expect(score.totalScore).toBeGreaterThan(0.5);
    expect(score.totalScore).toBeLessThan(0.75);
    expect(score.recruiterOrManagerScore).toBe(1);
    expect(score.skillScore).toBe(0);
  });

  it("ranks a technically related person moderately", () => {
    // Daniel Kim: exact role match and partial skills, but a different company and domain.
    const score = scorePersonForJob(graph, "person:5", jobId);
    expect(score.totalScore).toBeGreaterThan(0.25);
    expect(score.totalScore).toBeLessThan(0.5);
    expect(score.companyScore).toBe(0);
    expect(score.roleScore).toBe(1);
  });

  it("ranks a weakly related person low", () => {
    // Lena Fischer: different company, unrelated role/domain, one generic skill (Python).
    const score = scorePersonForJob(graph, "person:9", jobId);
    expect(score.totalScore).toBeLessThan(0.2);
  });

  it("never lets skill overlap alone reach a 'high' score", () => {
    // Skill overlap's weight caps its own contribution - this is what makes
    // requirement #7 ("don't let Python alone rank someone highly") true by
    // construction, not by a special-cased override.
    const maxPossibleFromSkillAlone = WEIGHTS.skill * 1;
    expect(maxPossibleFromSkillAlone).toBeLessThan(0.2);
  });

  it("weighs structural signals (company + role + domain) above skill overlap", () => {
    const structuralWeight = WEIGHTS.company + WEIGHTS.role + WEIGHTS.domain;
    expect(structuralWeight).toBeGreaterThan(WEIGHTS.skill * 3);
  });

  it("gives a manager on the job's own domain a strong recruiterOrManagerScore", () => {
    // Sofia Reyes: manager of the exact team the job belongs to.
    const score = scorePersonForJob(graph, "person:3", jobId);
    expect(score.recruiterOrManagerScore).toBe(1);
    expect(score.totalScore).toBeGreaterThan(0.6);
  });
});

describe("rankPeopleForJob", () => {
  let graph: Graph;

  beforeAll(() => {
    graph = buildGraph(sampleCareerGraph);
  });

  it("returns every person, sorted highest score first", () => {
    const ranked = rankPeopleForJob(graph, sampleCareerGraph.job.id);
    expect(ranked).toHaveLength(sampleCareerGraph.people.length);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].totalScore).toBeGreaterThanOrEqual(ranked[i].totalScore);
    }
  });

  it("puts the exact-team person at the top", () => {
    const ranked = rankPeopleForJob(graph, sampleCareerGraph.job.id);
    expect(ranked[0].personId).toBe("person:1");
  });
});
