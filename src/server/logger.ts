/**
 * Structured JSON logger for server-side code.
 *
 * All log entries are emitted as a single JSON line so they are machine-parseable
 * in Vercel log drains, Cloudflare Logpush, or any external aggregator.
 *
 * Usage:
 *   import { log } from "@/server/logger";
 *   log.info("Payment initiated", { userId, amount });
 *   log.error("Failed to persist message", { threadId, error: err.message });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

function emit(level: LogLevel, msg: string, meta?: Record<string, unknown>): void {
  const entry = JSON.stringify({
    level,
    msg,
    ts: new Date().toISOString(),
    ...(meta ?? {}),
  });
  if (level === "error" || level === "warn") {
    console.error(entry);
  } else {
    console.log(entry);
  }
}

export const log = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit("error", msg, meta),
};
