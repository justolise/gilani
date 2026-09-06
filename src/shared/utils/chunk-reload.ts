/**
 * Utilities for detecting and handling stale asset / chunk loading errors
 * that occur when a new version of the app has been deployed and an existing
 * client tries to dynamically import a chunk that was replaced on the server.
 */

export function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const msg =
    err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("Loading chunk") ||
    msg.includes("Unexpected token '<'") ||
    msg.includes("is not a valid JavaScript MIME type")
  );
}

export function triggerChunkReload(reason: string): boolean {
  if (typeof window === "undefined") return false;

  const reloadKey = "gilaniai_last_chunk_reload";
  const lastReload = sessionStorage.getItem(reloadKey);
  const now = Date.now();

  // Limit auto-reload to once every 12 seconds to prevent infinite loops
  if (!lastReload || now - parseInt(lastReload, 10) > 12000) {
    sessionStorage.setItem(reloadKey, now.toString());
    console.warn(`[GilaniAI] Reloading page to fetch latest deployment assets: ${reason}`);
    window.location.reload();
    return true;
  }

  console.error(`[GilaniAI] Chunk load failure detected but reload rate-limited: ${reason}`);
  return false;
}
