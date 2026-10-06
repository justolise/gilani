import { createGoogle } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createFallback } from "ai-fallback";

// ─── Exponential back-off ─────────────────────────────────────────────────────
// Retries a single provider call up to `maxRetries` times when Safaricom/API
// returns a transient 429 or 503, with jittered delays, before the ai-fallback
// layer switches to the next provider.

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const RETRYABLE_PATTERNS = [/rate.?limit/i, /too many requests/i, /service.?unavailable/i];

function isRetryableError(err: any): boolean {
  const status: number | undefined = err?.status ?? err?.statusCode ?? err?.response?.status;
  if (status && RETRYABLE_STATUSES.has(status)) return true;
  const msg: string = err?.message ?? "";
  return RETRYABLE_PATTERNS.some((p) => p.test(msg));
}

async function withBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelayMs = 500): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (attempt > maxRetries || !isRetryableError(err)) throw err;
      // Jittered exponential delay: base * 2^attempt + random jitter
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 200;
      console.warn(
        `[AI Gateway] Retry ${attempt}/${maxRetries} after ${Math.round(delay)}ms — ${err?.message ?? err}`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// ─── Context truncation ───────────────────────────────────────────────────────
// Keeps the most recent messages within a rough token budget.
// Very long study sessions can exceed context windows, causing slow/failed
// responses. We prune from the oldest non-system messages first.

export interface ContextMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Trims a messages array so the total estimated token count stays under
 * `maxTokens`. Always preserves all `system` messages and at least the
 * last `keepLast` non-system turns.
 *
 * Token estimate: ~4 characters per token (conservative).
 */
export function truncateMessages(
  messages: ContextMessage[],
  maxTokens = 80_000,
  keepLast = 6,
): ContextMessage[] {
  const estimateTokens = (m: ContextMessage) => Math.ceil(m.content.length / 4);

  const systemMessages = messages.filter((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system");

  // Always keep the last `keepLast` turns
  const mustKeep = conversationMessages.slice(-keepLast);
  const candidates = conversationMessages.slice(0, -keepLast);

  // Count tokens already committed
  let tokenCount = [...systemMessages, ...mustKeep].reduce((acc, m) => acc + estimateTokens(m), 0);

  // Add older messages from newest to oldest until budget runs out
  const kept: ContextMessage[] = [];
  for (let i = candidates.length - 1; i >= 0; i--) {
    const t = estimateTokens(candidates[i]);
    if (tokenCount + t > maxTokens) break;
    kept.unshift(candidates[i]);
    tokenCount += t;
  }

  const truncated = candidates.length - kept.length;
  if (truncated > 0) {
    console.info(`[AI Gateway] Truncated ${truncated} older message(s) to fit context window.`);
  }

  return [...systemMessages, ...kept, ...mustKeep];
}

const stripQuotes = (str: string): string => {
  let s = str.trim();
  if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
  else if (s.startsWith("'") && s.endsWith("'")) s = s.slice(1, -1);
  return s;
};

/**
 * Checks a prompt for prompt injection or jailbreak attacks using Groq's
 * `meta-llama/llama-prompt-guard-2-22m` classifier model.
 *
 * Returns:
 * - isSafe: boolean (true if benign, false if attack score >= threshold)
 * - score: number (probability between 0.0 and 1.0)
 * - flagged: boolean
 */
export async function checkPromptGuard(
  promptText: string,
  threshold = 0.85,
): Promise<{ isSafe: boolean; score: number; flagged: boolean }> {
  const groqKey = stripQuotes(process.env.GROQ_API_KEY || "");
  if (!groqKey || !promptText || !promptText.trim()) {
    return { isSafe: true, score: 0, flagged: false };
  }

  try {
    // Truncate to first 1800 characters (~450 tokens) to comfortably fit within 512-token context window
    const truncatedPrompt = promptText.trim().slice(0, 1800);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-prompt-guard-2-22m",
        messages: [{ role: "user", content: truncatedPrompt }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[Prompt Guard] Groq returned status ${res.status}: ${res.statusText}`);
      return { isSafe: true, score: 0, flagged: false };
    }

    const data: any = await res.json();
    const rawContent = data?.choices?.[0]?.message?.content ?? "";
    const score = parseFloat(rawContent.trim());

    if (isNaN(score)) {
      console.warn(`[Prompt Guard] Received non-numeric classifier output: "${rawContent}"`);
      return { isSafe: true, score: 0, flagged: false };
    }

    const flagged = score >= threshold;
    return {
      isSafe: !flagged,
      score,
      flagged,
    };
  } catch (err: any) {
    console.warn("[Prompt Guard] Check skipped due to error:", err?.message ?? err);
    return { isSafe: true, score: 0, flagged: false };
  }
}

/**
 * Creates an AI provider dynamically selecting available providers from env keys.
 * Priority: Gemini > Groq > DeepSeek > OpenAI > Mistral
 */
export const createGoogleAiProvider = (apiKey?: string) => {
  const geminiKey = stripQuotes(
    apiKey || process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY || "",
  );
  const groqKey = stripQuotes(process.env.GROQ_API_KEY || "");
  const deepseekKey = stripQuotes(process.env.DEEPSEEK_API_KEY || "");
  const openaiKey = stripQuotes(process.env.OPENAI_API_KEY || "");
  const mistralKey = stripQuotes(process.env.MISTRAL_API_KEY || "");

  const isValidGeminiKey = geminiKey && geminiKey.trim() !== "";

  const activeProviders: ("openai" | "groq" | "google" | "mistral" | "deepseek")[] = [];
  if (isValidGeminiKey) activeProviders.push("google");
  if (groqKey) activeProviders.push("groq");
  if (deepseekKey) activeProviders.push("deepseek");
  if (openaiKey) activeProviders.push("openai");
  if (mistralKey) activeProviders.push("mistral");

  if (activeProviders.length === 0) {
    throw new Error(
      "[AI Gateway] No AI provider API key configured. " +
        "Set at least one of: GEMINI_API_KEY, GROQ_API_KEY, DEEPSEEK_API_KEY, OPENAI_API_KEY, MISTRAL_API_KEY.",
    );
  }

  const instantiatedProviders = activeProviders.map((providerName) => {
    if (providerName === "google") {
      const googleInstance = createGoogle({ apiKey: geminiKey });
      return {
        name: "google" as const,
        chatModel: (modelId?: string) => {
          const cleanModelId =
            modelId && modelId.includes("gemini")
              ? modelId.replace(/^google\//, "")
              : "gemini-2.5-flash";
          return googleInstance(cleanModelId);
        },
      };
    }
    if (providerName === "groq") {
      const groq = createOpenAICompatible({
        name: "groq",
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: groqKey,
      });
      return {
        name: "groq" as const,
        chatModel: (modelId?: string) => {
          if (
            modelId === "meta-llama/llama-prompt-guard-2-22m" ||
            modelId === "groq/meta-llama/llama-prompt-guard-2-22m"
          ) {
            return groq.chatModel("meta-llama/llama-prompt-guard-2-22m");
          }
          const isExplicit =
            modelId &&
            !modelId.includes("gemini") &&
            !modelId.includes("google") &&
            (modelId.startsWith("openai/") ||
              modelId.startsWith("canopylabs/") ||
              modelId.startsWith("meta-llama/") ||
              modelId.startsWith("deepseek-r1") ||
              modelId.startsWith("groq/"));
          if (isExplicit) {
            return groq.chatModel(modelId.replace(/^groq\//, ""));
          }
          // Default Groq fallback: Primary gpt-oss-120b, with fallback to gpt-oss-20b
          return createFallback({
            models: [
              groq.chatModel("openai/gpt-oss-120b"),
              groq.chatModel("openai/gpt-oss-20b"),
            ] as any,
            onError: (err: any, failedModelId: string) => {
              console.warn(
                `[AI Gateway Groq] Model ${failedModelId} failed. Trying next Groq model... Reason:`,
                err?.message ?? err,
              );
            },
          });
        },
      };
    }
    if (providerName === "deepseek") {
      const deepseek = createOpenAICompatible({
        name: "deepseek",
        baseURL: "https://api.deepseek.com",
        apiKey: deepseekKey,
      });
      return {
        name: "deepseek" as const,
        chatModel: (modelId?: string) => {
          const cleanModelId =
            modelId && !modelId.includes("gemini") && !modelId.includes("google")
              ? modelId.replace(/^deepseek\//, "")
              : "deepseek-chat";
          return deepseek.chatModel(cleanModelId);
        },
      };
    }
    if (providerName === "openai") {
      const openai = createOpenAICompatible({
        name: "openai",
        baseURL: "https://api.openai.com/v1",
        apiKey: openaiKey,
      });
      return {
        name: "openai" as const,
        chatModel: (modelId?: string) => {
          const cleanModelId =
            modelId && !modelId.includes("gemini") && !modelId.includes("google")
              ? modelId.replace(/^openai\//, "")
              : "gpt-4.1-mini";
          return openai.chatModel(cleanModelId);
        },
      };
    }
    // mistral
    const mistral = createOpenAICompatible({
      name: "mistral",
      baseURL: "https://api.mistral.ai/v1",
      apiKey: mistralKey,
    });
    return {
      name: "mistral" as const,
      chatModel: (modelId?: string) => {
        const cleanModelId =
          modelId && !modelId.includes("gemini") && !modelId.includes("google")
            ? modelId.replace(/^mistral\//, "")
            : "mistral-large-latest";
        return mistral.chatModel(cleanModelId);
      },
    };
  });

  return {
    chatModel: (modelId?: string) => {
      const models = instantiatedProviders.map((p) => p.chatModel(modelId));

      if (models.length === 1) return models[0];

      // Falls back on retryable errors (429, 5xx, 401, 403, timeouts, etc.)
      // using ai-fallback's default detection. Non-retryable errors (e.g.
      // a malformed request) throw immediately instead of burning through
      // every provider.
      return createFallback({
        models: models as any,
        onError: (error: any, failedModelId: string) => {
          console.warn(
            `[AI Gateway] Chat Model ${failedModelId} failed. Falling back... Reason:`,
            error?.message ?? error,
          );
        },
      });
    },
    getAllChatModels: (
      modelId?: string,
      onlyProvider?: "openai" | "groq" | "google" | "mistral" | "deepseek",
    ) =>
      instantiatedProviders
        .filter((p) => !onlyProvider || p.name === onlyProvider)
        .map((p) => ({ model: p.chatModel(modelId), name: p.name })),
    textEmbeddingModel: (_modelId?: string) => {
      type EmbedAttempt = { name: string; getModel: () => any };

      const embedAttempts: EmbedAttempt[] = [];

      if (isValidGeminiKey) {
        embedAttempts.push({
          name: "google",
          getModel: () => {
            const googleInstance = createGoogle({ apiKey: geminiKey });
            return (googleInstance as any).textEmbeddingModel("gemini-embedding-2-preview", {
              outputDimensionality: 768,
            });
          },
        });
      }
      if (openaiKey) {
        embedAttempts.push({
          name: "openai",
          getModel: () => {
            const openai = createOpenAICompatible({
              name: "openai",
              baseURL: "https://api.openai.com/v1",
              apiKey: openaiKey,
            });
            return openai.textEmbeddingModel("text-embedding-3-small");
          },
        });
      }
      if (mistralKey) {
        embedAttempts.push({
          name: "mistral",
          getModel: () => {
            const mistral = createOpenAICompatible({
              name: "mistral",
              baseURL: "https://api.mistral.ai/v1",
              apiKey: mistralKey,
            });
            return mistral.textEmbeddingModel("mistral-embed");
          },
        });
      }

      if (embedAttempts.length === 0) {
        throw new Error(
          "[AI Gateway] No embedding-capable provider configured. Set GEMINI_API_KEY, OPENAI_API_KEY, or MISTRAL_API_KEY.",
        );
      }

      // Tries each provider's embedding model in order, falling through to
      // the next on rate-limit/auth/server errors. Non-retryable errors
      // (e.g. malformed input) throw immediately instead of looping through
      // every provider and masking the real cause.
      return {
        ...embedAttempts[0].getModel(),
        doEmbed: async (options: any) => {
          let lastError: unknown;
          for (const attempt of embedAttempts) {
            try {
              const model = attempt.getModel();
              return await model.doEmbed(options);
            } catch (err: any) {
              lastError = err;
              const status = err?.status ?? err?.statusCode;
              const isRetryable =
                status === 429 ||
                status === 401 ||
                status === 403 ||
                status === 503 ||
                /rate.?limit/i.test(err?.message ?? "") ||
                /invalid authentication/i.test(err?.message ?? "") ||
                /permission.?denied/i.test(err?.message ?? "");
              console.warn(
                `[AI Gateway] Embedding via ${attempt.name} failed${
                  isRetryable ? ", trying next provider..." : " (not retryable):"
                }`,
                err?.message ?? err,
              );
              if (!isRetryable) throw err;
            }
          }
          throw lastError;
        },
      };
    },
  };
};

/**
 * @deprecated Use createGoogleAiProvider instead.
 */
export const createLovableAiGatewayProvider = createGoogleAiProvider;
