/**
 * Local scan score cache.
 *
 * The backend stores placeholder scores (aiScore: 50 for every scan) because
 * the Motoko heuristic engine is a stub. To show realistic, per-scan results
 * in history, the frontend caches the real detection scores (computed by
 * detector.ts) keyed by scan ID. When history is fetched from the backend,
 * these cached scores are merged in so the displayed verdict and confidence
 * bars reflect the actual analysis.
 */

export interface CachedScores {
  aiScore: number;
  humanScore: number;
  verdict: string;
  highlights: string;
  explanation: string;
}

const STORAGE_KEY = "aidetector_scan_scores";
const MAX_ENTRIES = 500;

function loadCache(): Record<string, CachedScores> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, CachedScores>;
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, CachedScores>): void {
  try {
    // Trim to MAX_ENTRIES (keep most recently added)
    const keys = Object.keys(cache);
    if (keys.length > MAX_ENTRIES) {
      const trimmed: Record<string, CachedScores> = {};
      for (const k of keys.slice(keys.length - MAX_ENTRIES)) {
        trimmed[k] = cache[k];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    }
  } catch {
    // Storage full — ignore
  }
}

/** Store the real detection scores for a scan ID. */
export function cacheScanScores(scanId: string, scores: CachedScores): void {
  const cache = loadCache();
  cache[scanId] = scores;
  saveCache(cache);
}

/** Retrieve cached scores for a scan ID, or null if not cached. */
export function getCachedScores(scanId: string): CachedScores | null {
  const cache = loadCache();
  return cache[scanId] ?? null;
}

/** Remove all cached scores (e.g. when user clears history). */
export function clearScanCache(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Remove a single cached score entry. */
export function removeCachedScore(scanId: string): void {
  const cache = loadCache();
  delete cache[scanId];
  saveCache(cache);
}
