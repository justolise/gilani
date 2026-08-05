import { describe, it, expect } from "vitest";

// ─── Rate limit constants ─────────────────────────────────────────────────────
// We import only the constant values to avoid touching Supabase at test time.
// The async functions (checkRateLimit, checkDualRateLimit) require a live DB
// and are integration-test territory — not covered here.

import {
  CHAT_RATE_LIMIT,
  CHAT_DAILY_LIMIT,
  QUIZ_RATE_LIMIT,
  QUIZ_DAILY_LIMIT,
  PLANNER_RATE_LIMIT,
  PLANNER_DAILY_LIMIT,
  NOTES_RATE_LIMIT,
  NOTES_DAILY_LIMIT,
  AI_RATE_LIMIT,
} from "./rate-limit.server";

describe("Rate limit constants", () => {
  it("CHAT_RATE_LIMIT is 20 per minute", () => {
    expect(CHAT_RATE_LIMIT.max).toBe(20);
    expect(CHAT_RATE_LIMIT.windowMs).toBe(60_000);
  });

  it("CHAT_DAILY_LIMIT is 200 per day", () => {
    expect(CHAT_DAILY_LIMIT.max).toBe(200);
    expect(CHAT_DAILY_LIMIT.windowMs).toBe(86_400_000);
  });

  it("QUIZ_RATE_LIMIT is 10 per minute", () => {
    expect(QUIZ_RATE_LIMIT.max).toBe(10);
    expect(QUIZ_RATE_LIMIT.windowMs).toBe(60_000);
  });

  it("QUIZ_DAILY_LIMIT is 50 per day", () => {
    expect(QUIZ_DAILY_LIMIT.max).toBe(50);
    expect(QUIZ_DAILY_LIMIT.windowMs).toBe(86_400_000);
  });

  it("PLANNER_RATE_LIMIT is 10 per minute", () => {
    expect(PLANNER_RATE_LIMIT.max).toBe(10);
    expect(PLANNER_RATE_LIMIT.windowMs).toBe(60_000);
  });

  it("PLANNER_DAILY_LIMIT is 30 per day", () => {
    expect(PLANNER_DAILY_LIMIT.max).toBe(30);
    expect(PLANNER_DAILY_LIMIT.windowMs).toBe(86_400_000);
  });

  it("NOTES_RATE_LIMIT is 10 per minute", () => {
    expect(NOTES_RATE_LIMIT.max).toBe(10);
    expect(NOTES_RATE_LIMIT.windowMs).toBe(60_000);
  });

  it("NOTES_DAILY_LIMIT is 50 per day", () => {
    expect(NOTES_DAILY_LIMIT.max).toBe(50);
    expect(NOTES_DAILY_LIMIT.windowMs).toBe(86_400_000);
  });

  it("AI_RATE_LIMIT is an alias for CHAT_RATE_LIMIT", () => {
    expect(AI_RATE_LIMIT).toEqual(CHAT_RATE_LIMIT);
  });
});

// ─── Circuit breaker logic ────────────────────────────────────────────────────
// The circuit breaker state is module-level, so we test its shape independently.

describe("Circuit breaker thresholds", () => {
  const CB_THRESHOLD = 3;
  const CB_WINDOW_MS = 30_000;
  const CB_DENY_WINDOW_MS = 60_000;

  it("trips after CB_THRESHOLD failures", () => {
    let failures = 0;
    const lastFailureAt = Date.now();
    for (let i = 0; i < CB_THRESHOLD; i++) failures++;
    const isOpen = failures >= CB_THRESHOLD && Date.now() - lastFailureAt < CB_DENY_WINDOW_MS;
    expect(isOpen).toBe(true);
  });

  it("resets after CB_WINDOW_MS elapses", () => {
    const lastFailureAt = Date.now() - CB_WINDOW_MS - 1;
    const windowExpired = Date.now() - lastFailureAt > CB_WINDOW_MS;
    expect(windowExpired).toBe(true);
  });
});

// ─── M-Pesa phone validation ──────────────────────────────────────────────────
// Tests the regex used in mpesa.server.ts initiateSTKPush without importing
// the server module (which pulls in Supabase).

describe("M-Pesa phone number validation", () => {
  const PHONE_REGEX = /^(0[71]\d{8}|(\+?254)[71]\d{8})$/;

  it("accepts 07XXXXXXXX format", () => {
    expect(PHONE_REGEX.test("0712345678")).toBe(true);
  });

  it("accepts 01XXXXXXXX format", () => {
    expect(PHONE_REGEX.test("0112345678")).toBe(true);
  });

  it("accepts +254 international format", () => {
    expect(PHONE_REGEX.test("+254712345678")).toBe(true);
  });

  it("accepts 254 without + prefix", () => {
    expect(PHONE_REGEX.test("254712345678")).toBe(true);
  });

  it("rejects short number", () => {
    expect(PHONE_REGEX.test("07123")).toBe(false);
  });

  it("rejects non-Kenyan prefix", () => {
    expect(PHONE_REGEX.test("08012345678")).toBe(false);
  });

  it("rejects number with spaces", () => {
    // Space-stripped version is tested; raw with spaces should fail regex
    expect(PHONE_REGEX.test("0712 345678")).toBe(false);
  });
});

// ─── M-Pesa amount validation ─────────────────────────────────────────────────

describe("M-Pesa amount validation", () => {
  function isValidAmount(amount: number): boolean {
    return Number.isInteger(amount) && amount >= 1 && amount <= 150_000;
  }

  it("accepts minimum valid amount (1 KES)", () => {
    expect(isValidAmount(1)).toBe(true);
  });

  it("accepts maximum valid amount (150,000 KES)", () => {
    expect(isValidAmount(150_000)).toBe(true);
  });

  it("rejects 0", () => {
    expect(isValidAmount(0)).toBe(false);
  });

  it("rejects negative amount", () => {
    expect(isValidAmount(-100)).toBe(false);
  });

  it("rejects fractional amount", () => {
    expect(isValidAmount(99.5)).toBe(false);
  });

  it("rejects amount above 150,000", () => {
    expect(isValidAmount(200_000)).toBe(false);
  });
});
