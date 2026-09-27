import { describe, expect, it, vi } from "vitest";
import type { AiProvider } from "../ai/AiProvider.js";
import {
  analyzeCvAgainstJd,
  AiInputRejectedError,
  AnalysisFailedError,
} from "../services/analysisService.js";

const VALID_REPORT_JSON = JSON.stringify({
  matchedRequirements: [
    { requirement: "Node.js", tier: "must_have", evidence: "Built services in Node.js" },
  ],
  missingRequirements: [{ requirement: "Kubernetes", tier: "nice_to_have" }],
  seniorityAlignment: {
    jdExpectation: "5+ years",
    cvEvidence: "5 years experience",
    aligned: true,
  },
  fitSummary: "Strong match.",
  suitabilityScore: 8,
  scoreRationale: "4/5 must-haves matched.",
});

function fakeProvider(responses: string[]): AiProvider {
  const complete = vi.fn();
  responses.forEach((r) => complete.mockResolvedValueOnce(r));
  return { complete };
}

/**
 * Like fakeProvider, but each step is either a string (resolves) or an
 * Error (rejects) — for simulating provider/HTTP-level failures, not just
 * malformed responses.
 */
function fakeProviderWithFailures(steps: (string | Error)[]): AiProvider {
  const complete = vi.fn();
  steps.forEach((step) => {
    if (step instanceof Error) {
      complete.mockRejectedValueOnce(step);
    } else {
      complete.mockResolvedValueOnce(step);
    }
  });
  return { complete };
}

describe("analyzeCvAgainstJd", () => {
  it("returns the parsed report on a valid first response", async () => {
    const provider = fakeProvider([VALID_REPORT_JSON]);
    const report = await analyzeCvAgainstJd(provider, "some jd", "some cv");
    expect(report.suitabilityScore).toBe(8);
    expect(provider.complete).toHaveBeenCalledTimes(1);
  });

  it("strips ```json code fences before parsing", async () => {
    const provider = fakeProvider(["```json\n" + VALID_REPORT_JSON + "\n```"]);
    const report = await analyzeCvAgainstJd(provider, "some jd", "some cv");
    expect(report.suitabilityScore).toBe(8);
  });

  it("retries once on malformed JSON, then succeeds", async () => {
    const provider = fakeProvider(["not json at all", VALID_REPORT_JSON]);
    const report = await analyzeCvAgainstJd(provider, "some jd", "some cv");
    expect(report.suitabilityScore).toBe(8);
    expect(provider.complete).toHaveBeenCalledTimes(2);
  });

  it("retries once on schema-invalid JSON, then succeeds", async () => {
    const invalid = JSON.stringify({ foo: "bar" });
    const provider = fakeProvider([invalid, VALID_REPORT_JSON]);
    const report = await analyzeCvAgainstJd(provider, "some jd", "some cv");
    expect(report.suitabilityScore).toBe(8);
  });

  it("throws AnalysisFailedError if both attempts are unparseable", async () => {
    const provider = fakeProvider(["nope", "still nope"]);
    await expect(analyzeCvAgainstJd(provider, "some jd", "some cv")).rejects.toThrow(
      AnalysisFailedError
    );
  });

  it("throws AiInputRejectedError when the model reports an error shape", async () => {
    const provider = fakeProvider([JSON.stringify({ error: "This is not a CV" })]);
    await expect(analyzeCvAgainstJd(provider, "some jd", "some cv")).rejects.toThrow(
      AiInputRejectedError
    );
  });

  it("does not retry after an explicit AI error response", async () => {
    const provider = fakeProvider([JSON.stringify({ error: "This is not a CV" })]);
    await expect(analyzeCvAgainstJd(provider, "some jd", "some cv")).rejects.toThrow();
    expect(provider.complete).toHaveBeenCalledTimes(1);
  });

  it("retries once when the provider call itself fails (HTTP/network error), then succeeds", async () => {
    const provider = fakeProviderWithFailures([
      new Error("Groq API error (400): json_validate_failed"),
      VALID_REPORT_JSON,
    ]);
    const report = await analyzeCvAgainstJd(provider, "some jd", "some cv");
    expect(report.suitabilityScore).toBe(8);
    expect(provider.complete).toHaveBeenCalledTimes(2);
  });

  it("throws AnalysisFailedError (not a raw error) if the provider call fails on both attempts", async () => {
    const provider = fakeProviderWithFailures([
      new Error("Groq API error (500): internal error"),
      new Error("Groq API error (500): internal error"),
    ]);
    await expect(analyzeCvAgainstJd(provider, "some jd", "some cv")).rejects.toThrow(
      AnalysisFailedError
    );
  });
});
