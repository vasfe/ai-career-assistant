import type { Report } from "@ai-career-assistant/shared";
import ScoreBadge from "./ScoreBadge";
import RequirementList from "./RequirementList";

interface ReportViewProps {
  report: Report;
}

export default function ReportView({ report }: ReportViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
        <ScoreBadge score={report.suitabilityScore} />
        <p style={{ margin: 0, color: "var(--ink-soft)", maxWidth: "40ch" }}>{report.scoreRationale}</p>
      </div>

      <section>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Overall fit</h2>
        <p style={{ margin: 0, maxWidth: "70ch", lineHeight: 1.6 }}>{report.fitSummary}</p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>Experience level</h2>
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            border: "1px solid var(--border)",
            background: "var(--paper-raised)",
            padding: "0.9rem 1.1rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>Role expects</div>
            <div>{report.seniorityAlignment.jdExpectation}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>CV shows</div>
            <div>{report.seniorityAlignment.cvEvidence}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>Aligned</div>
            <div style={{ color: report.seniorityAlignment.aligned ? "var(--match)" : "var(--gap)" }}>
              {report.seniorityAlignment.aligned ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>Requirements</h2>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <RequirementList title="Matched" items={report.matchedRequirements} variant="matched" />
          <RequirementList title="Missing" items={report.missingRequirements} variant="missing" />
        </div>
      </section>
    </div>
  );
}
