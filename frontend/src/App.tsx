import { useState } from "react";
import type { Report } from "@ai-career-assistant/shared";
import UploadForm from "./components/UploadForm";
import ReportView from "./components/ReportView";
import { analyzeCvAgainstJd, ApiError } from "./api";

type ViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; report: Report };

export default function App() {
  const [state, setState] = useState<ViewState>({ status: "idle" });

  async function handleSubmit(input: { cvFile: File; jdText: string }) {
    setState({ status: "loading" });
    try {
      const report = await analyzeCvAgainstJd(input);
      setState({ status: "success", report });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Try again.";
      setState({ status: "error", message });
    }
  }

  return (
    <div style={{ maxWidth: "880px", margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.9rem", marginBottom: "0.4rem" }}>AI Career Assistant</h1>
        <p style={{ margin: 0, color: "var(--ink-soft)", maxWidth: "60ch" }}>
          Upload your CV and a job description. Get back a structured read on what matches,
          what's missing, and how strong the fit is.
        </p>
      </header>

      <UploadForm onSubmit={handleSubmit} isSubmitting={state.status === "loading"} />

      <div style={{ marginTop: "2.5rem" }}>
        {state.status === "error" && (
          <p style={{ color: "var(--gap)" }} role="alert">
            {state.message}
          </p>
        )}
        {state.status === "loading" && <p style={{ color: "var(--ink-soft)" }}>Reading both documents…</p>}
        {state.status === "success" && <ReportView report={state.report} />}
      </div>
    </div>
  );
}
