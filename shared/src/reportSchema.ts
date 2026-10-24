import { z } from "zod";

/**
 * A single requirement extracted from the job description, tagged with
 * whether the JD treats it as essential ("must_have") or a bonus
 * ("nice_to_have"), and — for matches — the CV evidence that supports it.
 */
export const RequirementMatchSchema = z.object({
  requirement: z.string().min(1),
  tier: z.enum(["must_have", "nice_to_have"]),
  evidence: z.string().min(1).optional(),
});
export type RequirementMatch = z.infer<typeof RequirementMatchSchema>;

export const SeniorityAlignmentSchema = z.object({
  jdExpectation: z.string().min(1),
  cvEvidence: z.string().min(1),
  aligned: z.boolean(),
});
export type SeniorityAlignment = z.infer<typeof SeniorityAlignmentSchema>;

/** The full structured report the AI must produce for a given CV/JD pair. */
export const ReportSchema = z.object({
  matchedRequirements: z.array(RequirementMatchSchema),
  missingRequirements: z.array(RequirementMatchSchema),
  seniorityAlignment: SeniorityAlignmentSchema,
  fitSummary: z.string().min(1),
  suitabilityScore: z.number().int().min(1).max(10),
  scoreRationale: z.string().min(1)
});
export type Report = z.infer<typeof ReportSchema>;

/**
 * The model is instructed to return this shape instead of a report when the
 * input isn't usable (empty, garbled, or clearly not a CV/JD).
 */
export const AiErrorSchema = z.object({
  error: z.string().min(1),
});
export type AiError = z.infer<typeof AiErrorSchema>;

/** Raw shape returned by the AI provider before we know which case it is. */
export const AiResponseSchema = z.union([ReportSchema, AiErrorSchema]);
export type AiResponse = z.infer<typeof AiResponseSchema>;
