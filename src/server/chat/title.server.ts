/**
 * AI-assisted Session Title Generation
 *
 * Generates short, concise (3-5 words) titles for study sessions based on
 * the student's initial question or prompt, with graceful fallbacks.
 */

const FALLBACK_DEFAULT_TITLE = "Study Session";
const MAX_TITLE_LENGTH = 80;

/**
 * Generates a short descriptive title from the student's initial message.
 * Attempts AI generation with retry/backoff, and falls back to text extraction
 * if AI generation is unavailable.
 */
export async function generateSessionTitle(initialPrompt: string): Promise<string> {
  let title = "";

  try {
    const { createGoogleAiProvider } = await import("@/server/ai-gateway.server");
    const { generateText } = await import("ai");
    const gateway = createGoogleAiProvider();
    const models = gateway.getAllChatModels("gemini-2.5-flash");

    for (let i = 0; i < models.length; i++) {
      const { model, name } = models[i];
      try {
        if (i > 0) {
          const { backoffDelay } = await import("@/shared/utils/provider-backoff");
          await backoffDelay(i);
        }

        const cleanPrompt = initialPrompt.slice(0, 300).trim();
        const result = await generateText({
          model: model as any,
          maxTokens: 25,
          prompt: `Generate a short 3 to 5 word topic title for a student study session that begins with this question: "${cleanPrompt}". Return ONLY the title words. No quotes, no prefix like "Title:", no ending punctuation.`,
        } as any);

        if (result.text && result.text.trim()) {
          title = result.text.trim();
          break;
        }
      } catch (err) {
        console.warn(`[Title Gen] Attempt with model ${name} failed:`, err);
      }
    }
  } catch (gatewayErr) {
    console.warn("[Title Gen] Gateway initialization failed:", gatewayErr);
  }

  // Strip extraneous quotes, markdown, or label prefixes
  if (title) {
    title = title.replace(/^["'“”‘“#*\s]+|["'“”’*\s]+$/g, "").trim();
    title = title.replace(/^(title|session|study session|topic):\s*/i, "").trim();
  }

  // Fallback to the first few words of the prompt if AI output was empty or too short
  if (!title || title.length < 2) {
    const words = initialPrompt
      .replace(/<[^>]+>/g, "")
      .replace(/\[[^\]]+\]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 5)
      .join(" ");

    title = words.length > 50 ? words.slice(0, 47) + "…" : words || FALLBACK_DEFAULT_TITLE;
  }

  return title.slice(0, MAX_TITLE_LENGTH).trim();
}
