import { ReportSchema, type Report } from "@ai-career-assistant/shared";
import type { AiProvider } from "../ai/AiProvider.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "../ai/prompts/analyzePrompt.js";

export class AiInputRejectedError extends Error {}
export class AnalysisFailedError extends Error {}

/**
 * Strips code-fence wrappers a model sometimes adds despite instructions
 * (```json ... ```) before attempting to parse.
 */
function stripCodeFences(raw: string): string {
  return raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
}

function tryParseReport(raw: string): { report: Report } | { aiError: string } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(raw));
  } catch (err) {
    console.error(
      "[analysisService] Response was not valid JSON:",
      err instanceof Error ? err.message : err,
      "\n--- raw response (first 2000 chars) ---\n",
      raw.slice(0, 2000)
    );
    return null;
  }

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "error" in parsed &&
    typeof (parsed as { error: unknown }).error === "string"
  ) {
    return { aiError: (parsed as { error: string }).error };
  }

  const result = ReportSchema.safeParse(parsed);
  if (!result.success) {
    console.error(
      "[analysisService] Response parsed as JSON but failed schema validation:",
      JSON.stringify(result.error.issues, null, 2),
      "\n--- parsed value ---\n",
      JSON.stringify(parsed, null, 2).slice(0, 2000)
    );
    return null;
  }
  return { report: result.data };
}

/**
 * Runs the CV-vs-JD analysis: builds the prompt, calls the AI provider,
 * and validates the response against ReportSchema.
 *
 * Failure handling:
 *  1. If the model explicitly says the input isn't a usable CV/JD pair,
 *     that's surfaced as a rejected-input error (not a retry case).
 *  2. Any other failure — the response doesn't parse as JSON, fails schema
 *     validation, or the provider call itself fails (HTTP error, network
 *     error, empty response) — gets one retry with the same prompt.
 *  3. If the retry also fails for any of those reasons, throw
 *     AnalysisFailedError so the route can return a clean 502.
 */
export async function analyzeCvAgainstJd(
  provider: AiProvider,
  jdText: string,
  cvText: string
): Promise<Report> {
  const systemPrompt = SYSTEM_PROMPT;
  const userPrompt = buildUserPrompt(jdText, cvText);

  const attempt = async (): Promise<
    { report: Report } | { aiError: string } | null
  > => {
    let raw: string;
    try {
      raw = await provider.complete({ systemPrompt, userPrompt });
    } catch (err) {
      console.error(
        "[analysisService] Provider call failed:",
        err instanceof Error ? err.message : err
      );
      // Treated the same as an unparseable response so it gets the same
      // one retry, rather than escaping the retry path entirely.
      return null;
    }
    return tryParseReport(raw);
  };

  const first = await attempt();

  if (first && "aiError" in first) {
    throw new AiInputRejectedError(first.aiError);
  }
  if (first && "report" in first) {
    return first.report;
  }

  // First attempt didn't parse/validate — retry once.
  const second = await attempt();

  if (second && "aiError" in second) {
    throw new AiInputRejectedError(second.aiError);
  }
  if (second && "report" in second) {
    return second.report;
  }

  throw new AnalysisFailedError(
    "The AI response could not be parsed into a valid report after a retry."
  );
}
