// ─── Profile cache (per-user, 60s TTL) ──────────────────────────────────────
export interface CachedProfile {
  studentName?: string | null;
  curriculum: string;
  tutorTone: string;
  tutorStyle: string;
  tutorDepth: string;
}

const _profileCache = new Map<
  string,
  {
    data: CachedProfile;
    expiresAt: number;
  }
>();

export function getCachedProfile(userId: string): CachedProfile | null {
  const entry = _profileCache.get(userId);
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  return null;
}

export function setCachedProfile(userId: string, data: CachedProfile) {
  _profileCache.set(userId, { data, expiresAt: Date.now() + 60_000 });
}

export function isRateLimitError(error: unknown): boolean {
  if (!error) return false;
  const err = error as any;
  const msg = String(err?.message || err?.error?.message || JSON.stringify(err) || "");
  return (
    err?.statusCode === 429 ||
    msg.includes("rate_limit") ||
    msg.includes("Rate limit") ||
    msg.includes("quota") ||
    msg.includes("insufficient_quota") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
}
