// pdf-parse ships no types and its default export is CJS-flavoured; import
// it this way to keep it working under NodeNext + esModuleInterop.
import pdfParse from "pdf-parse";

export class PdfExtractionError extends Error {}

// Keeps a single CV comfortably within the token budget shared with the JD
// text and the fixed few-shot/system-prompt overhead — see apiContract.ts's
// MAX_JD_CHARS note. Deliberately conservative: a looser 6,000-char cap
// still hit Groq's 8,000 TPM limit in real testing, so this isn't tuned to
// a token estimate — that estimate has already proven optimistic once.
const MAX_CV_CHARS = 3_000;

/** Extracts plain text from a PDF buffer (the CV upload). MVP only supports PDF */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const result = await pdfParse(buffer);
    const text = result.text.trim();
    if (!text) {
      throw new PdfExtractionError("PDF contained no extractable text");
    }
    return text.slice(0, MAX_CV_CHARS);
  } catch (err) {
    if (err instanceof PdfExtractionError) throw err;
    throw new PdfExtractionError(
      `Failed to parse PDF: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
