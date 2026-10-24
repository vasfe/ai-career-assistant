interface ScoreBadgeProps {
  score: number; // 1-10
}

function bandLabel(score: number): string {
  if (score >= 9) return "Excellent fit";
  if (score >= 7) return "Strong fit";
  if (score >= 5) return "Partial fit";
  if (score >= 3) return "Weak fit";
  return "Poor fit";
}

function bandColor(score: number): { fg: string; bg: string } {
  if (score >= 7) return { fg: "var(--match)", bg: "var(--match-bg)" };
  if (score >= 5) return { fg: "#8a6d1f", bg: "#f7f0dc" };
  return { fg: "var(--gap)", bg: "var(--gap-bg)" };
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  const { fg, bg } = bandColor(score);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "0.6rem",
        padding: "0.65rem 1.1rem",
        background: bg,
        border: `1px solid ${fg}33`,
        borderRadius: "4px",
      }}
    >
      <span style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 600, color: fg }}>
        {score}
        <span style={{ fontSize: "1.1rem", color: "var(--ink-soft)" }}>/10</span>
      </span>
      <span style={{ color: fg, fontWeight: 500 }}>{bandLabel(score)}</span>
    </div>
  );
}
