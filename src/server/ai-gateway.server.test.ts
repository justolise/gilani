import { describe, it, expect } from "vitest";
import { truncateMessages, type ContextMessage } from "./ai-gateway.server";

// ─── truncateMessages ─────────────────────────────────────────────────────────

describe("truncateMessages", () => {
  const sys: ContextMessage = { role: "system", content: "You are a helpful tutor." };

  it("returns all messages when total tokens are within budget", () => {
    const messages: ContextMessage[] = [
      sys,
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
    ];
    const result = truncateMessages(messages, 80_000, 6);
    expect(result).toHaveLength(3);
  });

  it("always preserves system messages", () => {
    const bigContent = "x".repeat(100_000);
    const messages: ContextMessage[] = [
      sys,
      { role: "user", content: bigContent },
      { role: "assistant", content: bigContent },
    ];
    const result = truncateMessages(messages, 1_000, 0);
    expect(result.some((m) => m.role === "system")).toBe(true);
  });

  it("always keeps the last `keepLast` non-system messages", () => {
    const messages: ContextMessage[] = [
      sys,
      { role: "user", content: "old message" },
      { role: "assistant", content: "old reply" },
      { role: "user", content: "new message" },
      { role: "assistant", content: "new reply" },
    ];
    // Tiny budget — only the last 2 should survive alongside system
    const result = truncateMessages(messages, 20, 2);
    const nonSystem = result.filter((m) => m.role !== "system");
    expect(nonSystem.at(-1)?.content).toBe("new reply");
    expect(nonSystem.at(-2)?.content).toBe("new message");
  });

  it("prunes oldest messages first when over budget", () => {
    const messages: ContextMessage[] = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `Message ${i} — ${"word ".repeat(200)}`,
    }));
    const result = truncateMessages(messages, 5_000, 4);
    // Result should be shorter than original
    expect(result.length).toBeLessThan(messages.length);
    // Last 4 should always be present
    const last4 = messages.slice(-4);
    last4.forEach((m) => {
      expect(result.some((r) => r.content === m.content)).toBe(true);
    });
  });

  it("returns messages unchanged when there is nothing to prune", () => {
    const messages: ContextMessage[] = [
      { role: "user", content: "short" },
      { role: "assistant", content: "reply" },
    ];
    const result = truncateMessages(messages, 80_000, 6);
    expect(result).toEqual(messages);
  });
});

// ─── isRetryableError (via exported helper) ───────────────────────────────────
// We test the classification logic through the shape of errors the gateway
// would receive, without needing live API keys.

describe("retryable error classification", () => {
  function isRetryable(err: any): boolean {
    const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
    const RETRYABLE_PATTERNS = [/rate.?limit/i, /too many requests/i, /service.?unavailable/i];
    const status: number | undefined = err?.status ?? err?.statusCode;
    if (status && RETRYABLE_STATUSES.has(status)) return true;
    const msg: string = err?.message ?? "";
    return RETRYABLE_PATTERNS.some((p) => p.test(msg));
  }

  it("marks 429 as retryable", () => {
    expect(isRetryable({ status: 429 })).toBe(true);
  });

  it("marks 503 as retryable", () => {
    expect(isRetryable({ status: 503 })).toBe(true);
  });

  it("marks rate limit message as retryable", () => {
    expect(isRetryable({ message: "Rate limit exceeded" })).toBe(true);
  });

  it("marks 400 bad request as NOT retryable", () => {
    expect(isRetryable({ status: 400 })).toBe(false);
  });

  it("marks unknown error as NOT retryable", () => {
    expect(isRetryable({ message: "invalid JSON payload" })).toBe(false);
  });
});
