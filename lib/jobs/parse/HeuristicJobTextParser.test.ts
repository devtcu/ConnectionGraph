import { describe, expect, it } from "vitest";
import { HeuristicJobTextParser } from "@/lib/jobs/parse/HeuristicJobTextParser";

const SAMPLE_POSTING = `Senior Machine Learning Engineer

Company: Nimbus Health
Location: San Francisco, CA
Team: ML Platform

We're looking for a Senior Full-time Machine Learning Engineer to join the ML Platform team.

Required Qualifications:
- Strong experience with Python and PyTorch
- Experience with Distributed Systems and Kubernetes

Preferred Qualifications:
- Familiarity with MLOps and Deep Learning

Responsibilities:
- Build and scale model-serving infrastructure
- Partner with Data Science on risk-scoring products
`;

describe("HeuristicJobTextParser", () => {
  const parser = new HeuristicJobTextParser();

  it("extracts labeled fields", async () => {
    const profile = await parser.parse(SAMPLE_POSTING, "https://nimbus.example/careers/1");
    expect(profile.company).toBe("Nimbus Health");
    expect(profile.location).toBe("San Francisco, CA");
    expect(profile.team).toBe("ML Platform");
    expect(profile.sourceUrl).toBe("https://nimbus.example/careers/1");
  });

  it("splits required vs preferred skills by section", async () => {
    const profile = await parser.parse(SAMPLE_POSTING, null);
    expect(profile.requiredSkills).toEqual(expect.arrayContaining(["Python", "PyTorch", "Distributed Systems"]));
    expect(profile.preferredSkills).toEqual(expect.arrayContaining(["MLOps", "Deep Learning"]));
    // Preferred-section hits shouldn't also show up as required.
    expect(profile.requiredSkills).not.toContain("MLOps");
  });

  it("extracts bullet-point responsibilities", async () => {
    const profile = await parser.parse(SAMPLE_POSTING, null);
    expect(profile.responsibilities).toEqual(
      expect.arrayContaining(["Build and scale model-serving infrastructure"]),
    );
  });

  it("never invents fields that aren't in the text", async () => {
    const minimal = "This is a job posting about a role. It does not mention any structured fields at all here today.";
    const profile = await parser.parse(minimal, null);
    expect(profile.company).toBeNull();
    expect(profile.location).toBeNull();
    expect(profile.employmentType).toBeNull();
    expect(profile.requiredSkills).toEqual([]);
  });
});
