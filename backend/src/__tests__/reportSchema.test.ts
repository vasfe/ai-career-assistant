import { describe, expect, it } from "vitest";
import { ReportSchema, AiResponseSchema } from "@ai-career-assistant/shared";

const validReport = {
  matchedRequirements: [
    { requirement: "Node.js", tier: "must_have", evidence: "5 years building Node.js services" },
  ],
  missingRequirements: [{ requirement: "Kubernetes", tier: "nice_to_have" }],
  seniorityAlignment: {
    jdExpectation: "5+ years",
    cvEvidence: "5 years backend experience",
    aligned: true,
  },
  fitSummary: "Strong match overall.",
  suitabilityScore: 8,
  scoreRationale: "Most must-haves matched.",
};

describe("ReportSchema", () => {
  it("accepts a well-formed report", () => {
    const result = ReportSchema.safeParse(validReport);
    expect(result.success).toBe(true);
  });

  it("rejects a suitabilityScore outside 1-10", () => {
    const result = ReportSchema.safeParse({ ...validReport, suitabilityScore: 11 });
    expect(result.success).toBe(false);
  });

  it("rejects a suitabilityScore of 0", () => {
    const result = ReportSchema.safeParse({ ...validReport, suitabilityScore: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer suitabilityScore", () => {
    const result = ReportSchema.safeParse({ ...validReport, suitabilityScore: 7.5 });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid tier value", () => {
    const result = ReportSchema.safeParse({
      ...validReport,
      matchedRequirements: [{ requirement: "Node.js", tier: "sort_of" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a report missing a required field", () => {
    const { fitSummary, ...withoutFitSummary } = validReport;
    const result = ReportSchema.safeParse(withoutFitSummary);
    expect(result.success).toBe(false);
  });

  it("allows missingRequirements entries without evidence", () => {
    const result = ReportSchema.safeParse(validReport);
    expect(result.success).toBe(true);
  });
});

describe("AiResponseSchema", () => {
  it("accepts a valid report shape", () => {
    expect(AiResponseSchema.safeParse(validReport).success).toBe(true);
  });

  it("accepts the AI-error shape", () => {
    expect(AiResponseSchema.safeParse({ error: "Input is not a CV" }).success).toBe(true);
  });

  it("rejects something that is neither", () => {
    expect(AiResponseSchema.safeParse({ foo: "bar" }).success).toBe(false);
  });
});
