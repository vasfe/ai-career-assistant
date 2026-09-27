import type { AiProvider } from "./AiProvider.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Groq's chat completions endpoint is OpenAI-compatible, so this is a
 * fairly standard fetch-based client. Kept dependency-free (no Groq SDK)
 * to minimise what a future provider swap has to unpick.
 */
export class GroqProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async complete({
    systemPrompt,
    userPrompt,
  }: {
    systemPrompt: string;
    userPrompt: string;
  }): Promise<string> {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: .1,
        max_tokens: 2048,
        reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "<no body>");
      throw new Error(`Groq API error (${response.status}): ${body}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Groq API returned no message content");
    }
    return content;
  }
}
