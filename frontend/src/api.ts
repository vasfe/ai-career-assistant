import type { AnalyzeSuccessResponse, Report } from "@ai-career-assistant/shared";

export class ApiError extends Error {}

export interface AnalyzeInput {
  cvFile: File;
  jdText: string;
}

export async function analyzeCvAgainstJd(input: AnalyzeInput): Promise<Report> {
  const formData = new FormData();
  formData.set("cv", input.cvFile);
  formData.set("jdText", input.jdText);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message);
  }

  return (body as AnalyzeSuccessResponse).report;
}
