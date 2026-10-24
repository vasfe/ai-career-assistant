import type { RequirementMatch } from "@ai-career-assistant/shared";

interface RequirementListProps {
  title: string;
  items: RequirementMatch[];
  variant: "matched" | "missing";
}

export default function RequirementList({ title, items, variant }: RequirementListProps) {
  const color = variant === "matched" ? "var(--match)" : "var(--gap)";
  const bg = variant === "matched" ? "var(--match-bg)" : "var(--gap-bg)";

  return (
    <section style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>
        {title} <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>None.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {items.map((item, i) => (
            <li
              key={`${item.requirement}-${i}`}
              style={{
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${color}`,
                background: "var(--paper-raised)",
                padding: "0.6rem 0.8rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "baseline" }}>
                <span style={{ fontWeight: 500 }}>{item.requirement}</span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: item.tier === "must_have" ? color : "var(--ink-soft)",
                    background: item.tier === "must_have" ? bg : "transparent",
                    padding: item.tier === "must_have" ? "0.1rem 0.4rem" : 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.tier === "must_have" ? "must-have" : "nice-to-have"}
                </span>
              </div>
              {item.evidence && (
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: "var(--ink-soft)" }}>{item.evidence}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
