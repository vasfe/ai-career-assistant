import { useState } from "react";

interface UploadFormProps {
  onSubmit: (input: { cvFile: File; jdText: string }) => void;
  isSubmitting: boolean;
}

export default function UploadForm({ onSubmit, isSubmitting }: UploadFormProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!cvFile) {
      setFormError("Upload your CV as a PDF to continue.");
      return;
    }
    if (cvFile.type !== "application/pdf") {
      setFormError("Only PDF files are supported for the CV right now.");
      return;
    }
    if (!jdText.trim()) {
      setFormError("Paste the job description text to continue.");
      return;
    }

    onSubmit({ cvFile, jdText });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <label htmlFor="cv-upload" style={{ display: "block", fontWeight: 500, marginBottom: "0.4rem" }}>
          Your CV (PDF)
        </label>
        <input
          id="cv-upload"
          type="file"
          accept="application/pdf"
          onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          style={{ display: "block" }}
        />
      </div>

      <div>
        <label htmlFor="jd-text" style={{ display: "block", fontWeight: 500, marginBottom: "0.4rem" }}>
          Job description
        </label>
        <textarea
          id="jd-text"
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          rows={10}
          placeholder="Paste the full job description here…"
          style={{
            width: "100%",
            padding: "0.7rem",
            border: "1px solid var(--border)",
            background: "var(--paper-raised)",
            fontFamily: "inherit",
            fontSize: "0.95rem",
            resize: "vertical",
          }}
        />
      </div>

      {formError && <p style={{ color: "var(--gap)", margin: 0 }}>{formError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          alignSelf: "flex-start",
          padding: "0.7rem 1.4rem",
          background: isSubmitting ? "var(--ink-soft)" : "var(--ink)",
          color: "var(--paper)",
          border: "none",
          cursor: isSubmitting ? "default" : "pointer",
          fontSize: "0.95rem",
        }}
      >
        {isSubmitting ? "Analysing…" : "Analyse fit"}
      </button>
    </form>
  );
}
