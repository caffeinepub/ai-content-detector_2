/**
 * Splits text into sentences, respecting common sentence-ending punctuation.
 */
export function splitIntoSentences(text: string): string[] {
  // Split on ". ", "! ", "? " but keep the delimiter with the preceding sentence
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts.filter((s) => s.trim().length > 0);
}

/**
 * Parses a comma-separated highlights string into an array of indices.
 */
export function parseHighlightIndices(highlights: string): number[] {
  if (!highlights || highlights.trim() === "") return [];
  return highlights
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

/**
 * Builds an array of { text, highlighted } segments from a body of text.
 */
export function buildHighlightedSegments(
  text: string,
  highlights: string,
): { text: string; highlighted: boolean }[] {
  const sentences = splitIntoSentences(text);
  const highlightedIndices = new Set(parseHighlightIndices(highlights));

  return sentences.map((sentence, i) => ({
    text: sentence,
    highlighted: highlightedIndices.has(i),
  }));
}

/**
 * Formats a bigint timestamp (nanoseconds) into a human-readable string.
 */
export function formatTimestamp(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Truncates text to a given max length.
 */
export function truncate(text: string, maxLength = 80): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}
