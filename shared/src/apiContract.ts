import { z } from "zod";
import { ReportSchema } from "./reportSchema.js";

// Shares a tight token budget with the CV text and fixed prompt overhead —
// see analyzePrompt.ts and pdfExtractor.ts. A 6,000-char cap here still hit
// Groq's 8,000 TPM limit in real testing (a ~5,000-char JD alone pushed a
// request to 8,041 tokens), so this is deliberately conservative rather than
// tuned to a token estimate that's already proven optimistic once.
export const MAX_JD_CHARS = 3_000;

/**
 * POST /api/analyze is multipart/form-data:
 *  - cv:      File (PDF)
 *  - jdText:  string (the job description, pasted as plain text)
 *
 * This schema validates the non-file fields once extracted from the
 * multipart form on the backend; it isn't used to parse the multipart
 * body itself (multer/busboy handles that).
 */
export const AnalyzeRequestFieldsSchema = z.object({
  jdText: z.string().min(1, "Job description text is required"),
});
export type AnalyzeRequestFields = z.infer<typeof AnalyzeRequestFieldsSchema>;

export const AnalyzeSuccessResponseSchema = z.object({
  report: ReportSchema,
});
export type AnalyzeSuccessResponse = z.infer<typeof AnalyzeSuccessResponseSchema>;

export const AnalyzeErrorResponseSchema = z.object({
  error: z.string(),
});
export type AnalyzeErrorResponse = z.infer<typeof AnalyzeErrorResponseSchema>;
