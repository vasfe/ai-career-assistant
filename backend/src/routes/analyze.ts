import { Router } from "express";
import type express from "express";
import multer from "multer";
import { AnalyzeRequestFieldsSchema, MAX_JD_CHARS, type AnalyzeSuccessResponse } from "@ai-career-assistant/shared";
import { extractPdfText, PdfExtractionError } from "../services/pdfExtractor.js";
import {
  analyzeCvAgainstJd,
  AiInputRejectedError,
  AnalysisFailedError,
} from "../services/analysisService.js";
import { GroqProvider } from "../ai/GroqProvider.js";

export const analyzeRouter = Router();

export class InvalidCvTypeError extends Error {}

const upload = multer({
  storage: multer.memoryStorage(), // no disk writes — buffer only, matches the no-persistence decision
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB — plenty for a CV PDF
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new InvalidCvTypeError(`Unsupported file type '${file.mimetype}'. Please upload a PDF.`));
      return;
    }
    cb(null, true);
  },
});

/**
 * Wraps multer's callback-style middleware so upload failures (wrong file
 * type, file too large) become clean 422s instead of falling through to the
 * generic 500 handler — fail-fast and specific, before we touch PDF parsing,
 * or the AI call.
 */
function handleCvUpload(req: express.Request, res: express.Response, next: express.NextFunction) {
  upload.single("cv")(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof InvalidCvTypeError) {
      res.status(422).json({ error: err.message });
      return;
    }
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "CV file is too large (max 5MB)"
          : `Upload error: ${err.message}`;
      res.status(422).json({ error: message });
      return;
    }
    next(err);
  });
}

// Single shared provider instance. Swapping providers later means
// changing this one construction site.
const aiProvider = new GroqProvider(
  process.env.GROQ_API_KEY ?? "",
  process.env.GROQ_MODEL ?? "openai/gpt-oss-120b"
);

analyzeRouter.post("/analyze", handleCvUpload, async (req, res, next) => {
  if (!process.env.GROQ_API_KEY) {
    res.status(500).json({ error: "Server is misconfigured: missing GROQ_API_KEY" });
    return;
  }

  if (!req.file) {
    res.status(422).json({ error: "A CV file (PDF) is required under the 'cv' field" });
    return;
  }

  const fieldsResult = AnalyzeRequestFieldsSchema.safeParse(req.body);
  if (!fieldsResult.success) {
    res.status(422).json({ error: fieldsResult.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const { jdText } = fieldsResult.data;

  let cvText: string;
  try {
    cvText = await extractPdfText(req.file.buffer);
  } catch (err) {
    if (err instanceof PdfExtractionError) {
      res.status(422).json({ error: err.message });
      return;
    }
    // Express 4 does not catch rejected promises from async route handlers —
    // re-throwing here would become an unhandled rejection and crash the
    // whole process (this is exactly what caused every earlier Groq-error
    // "Node.js v22..." crash in testing). Route unexpected errors to the
    // app-level error middleware explicitly instead.
    next(err);
    return;
  }

  const resolvedJdText = jdText.slice(0, MAX_JD_CHARS);

  try {
    const report = await analyzeCvAgainstJd(aiProvider, resolvedJdText, cvText);
    const body: AnalyzeSuccessResponse = { report };
    res.status(200).json(body);
  } catch (err) {
    if (err instanceof AiInputRejectedError) {
      res.status(422).json({ error: err.message });
      return;
    }
    if (err instanceof AnalysisFailedError) {
      res.status(502).json({ error: err.message });
      return;
    }
    next(err);
  }
});
