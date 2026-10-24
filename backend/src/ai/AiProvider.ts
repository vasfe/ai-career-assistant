/**
 * Abstraction over "a chat-completion style LLM call that returns text".
 *
 * Keeping this interface deliberately narrow (one method, plain strings in
 * and out) means swapping Groq for another provider later (Claude, OpenAI,
 * etc.) only requires a new class that implements `complete` — nothing in
 * analysisService.ts or the prompt template needs to change.
 */
export interface AiProvider {
  /**
   * Sends a system prompt + user prompt to the model and returns its raw
   * text response. Callers are responsible for parsing/validating that
   * text (see analysisService.ts) — this interface doesn't assume JSON.
   */
  complete(params: { systemPrompt: string; userPrompt: string }): Promise<string>;
}
