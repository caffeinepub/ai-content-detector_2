/**
 * Enhanced AI detection engine v2.
 * 11 signals, tighter phrase lists, sigmoid calibration, normalized TTR.
 */

// ── AI Phrase Lists (tightened: only highly discriminative patterns) ────────

const TRANSITION_CONNECTORS: string[] = [
  "furthermore",
  "moreover",
  "additionally",
  "consequently",
  "nevertheless",
  "notwithstanding",
  "it follows that",
  "by extension",
  "to that end",
  "in light of",
  "due to the fact that",
  "as a consequence",
  "by the same token",
  "in a similar vein",
  "along the same lines",
  "on a related note",
  "in this regard",
  "with this in mind",
  "bearing this in mind",
  "taking this into account",
  "pertaining to",
  "when it comes to",
  "touching on",
  "moving on to",
  "in the wake of",
  "as a direct result",
];

const FILLER_AI_OPENERS: string[] = [
  "it is important to note",
  "it's important to note",
  "it is worth noting",
  "it's worth noting",
  "it should be noted",
  "it is worth mentioning",
  "it's worth mentioning",
  "needless to say",
  "it goes without saying",
  "it is clear that",
  "it's clear that",
  "it is evident that",
  "it's evident that",
  "it is obvious that",
  "it becomes clear",
  "as previously mentioned",
  "as mentioned earlier",
  "as stated above",
  "as noted above",
  "as outlined",
  "as highlighted",
  "as demonstrated",
  "it must be noted",
  "it bears noting",
  "it is worth emphasizing",
  "it cannot be overstated",
  "it is readily apparent",
  "it can be observed",
  "one must consider",
  "one must note",
  "it would be remiss",
];

const ACADEMIC_FORMAL: string[] = [
  "in conclusion",
  "in summary",
  "to summarize",
  "to conclude",
  "to recapitulate",
  "to recap",
  "in closing",
  "to wrap up",
  "in the final analysis",
  "all things considered",
  "on balance",
  "taken as a whole",
  "in the grand scheme",
  "in the broader context",
  "from a holistic perspective",
  "looking at the big picture",
  "of paramount importance",
  "of utmost importance",
  "throughout history",
  "in today's world",
  "in today's society",
  "in this essay",
  "in this paper",
  "in this article",
  "in this piece",
  "in this study",
  "in this analysis",
  "historically speaking",
  "from a historical perspective",
  "in the modern era",
  "in contemporary society",
];

const CORPORATE_AI_BUZZWORDS: string[] = [
  "leverage",
  "leverages",
  "leveraging",
  "facilitate",
  "facilitates",
  "facilitating",
  "streamline",
  "streamlines",
  "synergy",
  "synergize",
  "paradigm shift",
  "stakeholder",
  "stakeholders",
  "deliverable",
  "deliverables",
  "scalable",
  "scalability",
  "cutting-edge",
  "state-of-the-art",
  "best practices",
  "key takeaways",
  "actionable insights",
  "value-added",
  "game-changer",
  "game-changing",
  "thought leader",
  "thought leadership",
  "deep dive",
  "delve into",
  "delves into",
  "unpack",
  "unpacking",
  "multifaceted",
  "comprehensive overview",
  "in-depth analysis",
  "a myriad of",
  "plethora of",
  "a wide array of",
  "a wide range of",
  "diverse range",
  "diverse set",
  "broad spectrum",
  "full spectrum",
  "plays a crucial role",
  "plays an important role",
  "plays a key role",
  "in the realm of",
  "showcases",
  "underscores",
  "overarching",
  "multidimensional",
  "ever-evolving",
  "rapidly evolving",
  "continuously evolving",
  "transformative",
  "groundbreaking",
  "forward-thinking",
  "future-proof",
  "mission-critical",
  "best-in-class",
  "world-class",
  "next-generation",
  "end-to-end",
  "cross-functional",
];

const HEDGING_PHRASES: string[] = [
  "it can be argued",
  "it could be argued",
  "one might argue",
  "one could argue",
  "it is possible that",
  "it may be the case",
  "ostensibly",
  "presumably",
  "purportedly",
  "it is generally accepted",
  "it is widely believed",
  "it is commonly understood",
  "many experts believe",
  "research suggests",
  "studies indicate",
  "evidence suggests",
  "as some scholars argue",
  "from a certain perspective",
  "in some respects",
  "to a certain degree",
  "up to a point",
  "in some sense",
  "broadly speaking",
  "it could be said",
  "one might say",
  "it would seem",
  "it tends to be",
];

const PADDING_META: string[] = [
  "plays a significant role",
  "serves as a cornerstone",
  "acts as a foundation",
  "forms the basis",
  "lies at the heart",
  "is at the forefront",
  "is a testament to",
  "stands as a testament",
  "represents a significant",
  "marks a significant",
  "constitutes a major",
  "demonstrates the importance",
  "highlights the importance",
  "underscores the importance",
  "emphasizes the importance",
  "showcases the potential",
  "reveals the complexity",
  "explores the relationship",
  "examines the impact",
  "addresses the challenge",
  "tackles the issue",
  "navigates the complexity",
  "bridges the gap",
  "sheds light on",
  "opens up new possibilities",
  "paves the way",
  "lays the groundwork",
  "sets the stage",
  "provides a foundation",
  "serves as a reminder",
  "underscores the need",
  "reinforces the idea",
  "highlights the fact",
  "points to the need",
  "calls attention to",
];

const CONCLUSION_ADVICE: string[] = [
  "it is recommended",
  "it is advisable",
  "it is essential",
  "it is imperative",
  "it is necessary",
  "it is vital",
  "one should",
  "one must",
  "one ought to",
  "it is best to",
  "the best approach",
  "the most effective way",
  "the most efficient method",
  "the optimal solution",
  "the ideal approach",
  "moving forward",
  "going forward",
  "as we move forward",
  "as we look ahead",
  "looking ahead",
  "it is crucial that",
  "it is essential that",
  "it is imperative that",
  "steps must be taken",
  "action must be taken",
  "efforts must be made",
  "priority should be given",
  "attention should be paid",
  "consideration should be given",
  "care should be taken",
];

// Merge all phrase categories into one master list
const AI_PHRASES: string[] = [
  ...TRANSITION_CONNECTORS,
  ...FILLER_AI_OPENERS,
  ...ACADEMIC_FORMAL,
  ...CORPORATE_AI_BUZZWORDS,
  ...HEDGING_PHRASES,
  ...PADDING_META,
  ...CONCLUSION_ADVICE,
];

// AI video filename keywords
const AI_VIDEO_KEYWORDS: string[] = [
  "sora",
  "runway",
  "pika",
  "kling",
  "luma",
  "gen2",
  "gen3",
  "gen-2",
  "gen-3",
  "synthesia",
  "heygen",
  "d-id",
  "invideo",
  "kaiber",
  "moonvalley",
  "stable",
  "diffusion",
  "ai",
  "generated",
  "synthetic",
  "artificial",
];

// AI image filename keywords
const AI_IMAGE_KEYWORDS: string[] = [
  "ai",
  "generated",
  "dalle",
  "midjourney",
  "stable",
  "diffusion",
  "flux",
  "gpt",
  "artificial",
  "synthetic",
  "comfyui",
  "sdxl",
  "runway",
  "sora",
  "kling",
  "pika",
  "luma",
  "firefly",
  "ideogram",
  "leonardoai",
];

// Common English contractions — low usage in AI text
const CONTRACTIONS: string[] = [
  "i'm",
  "i've",
  "i'd",
  "i'll",
  "you're",
  "you've",
  "you'd",
  "you'll",
  "he's",
  "he'd",
  "he'll",
  "she's",
  "she'd",
  "she'll",
  "it's",
  "it'd",
  "we're",
  "we've",
  "we'd",
  "we'll",
  "they're",
  "they've",
  "they'd",
  "they'll",
  "that's",
  "that'd",
  "that'll",
  "who's",
  "who'd",
  "who'll",
  "what's",
  "what'd",
  "where's",
  "when's",
  "why's",
  "how's",
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
  "hasn't",
  "haven't",
  "hadn't",
  "doesn't",
  "don't",
  "didn't",
  "won't",
  "wouldn't",
  "can't",
  "cannot",
  "couldn't",
  "shouldn't",
  "mustn't",
  "let's",
  "there's",
  "here's",
  "there've",
  "there'd",
];

// "to be" auxiliaries for passive voice detection
const TO_BE_FORMS = ["is", "are", "was", "were", "be", "been", "being", "am"];

// ── Utility Functions ──────────────────────────────────────────────────────

function toLower(t: string): string {
  return t.toLowerCase();
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

/** Sigmoid calibration: pushes scores decisively away from center */
function sigmoid(x: number): number {
  // Input x is 0–100. Center at 50.
  const z = (x - 50) / 12; // steepness factor
  const s = 1 / (1 + Math.exp(-z));
  // Scale output: s is 0–1, map to 5–95
  return Math.round(5 + s * 90);
}

// ── Signal Computation Functions ──────────────────────────────────────────

/** Signal 1 (20%): AI phrase density — more hits = more AI */
function computePhraseDensity(
  lower: string,
  wordCount: number,
): { score: number; hitCount: number } {
  let hits = 0;
  for (const phrase of AI_PHRASES) {
    if (lower.includes(phrase)) hits++;
  }
  if (wordCount === 0) return { score: 0, hitCount: 0 };
  const density = (hits / wordCount) * 100;
  const base = Math.min(95, hits * 7 + density * 4);
  return { score: Math.round(base), hitCount: hits };
}

/** Signal 2 (15%): Moving Average Type-Token Ratio (MATTR) — normalized vocabulary diversity */
function computeMATTR(text: string): { score: number; mattr: number } {
  const lower = toLower(text);
  const words = lower
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z]/g, ""))
    .filter((w) => w.length > 1);
  if (words.length < 10) return { score: 50, mattr: 0.5 };

  const windowSize = Math.min(50, Math.floor(words.length / 2));
  const ttrs: number[] = [];
  for (let i = 0; i <= words.length - windowSize; i++) {
    const window = words.slice(i, i + windowSize);
    const unique = new Set(window).size;
    ttrs.push(unique / windowSize);
  }
  const mattr = ttrs.reduce((a, b) => a + b, 0) / ttrs.length;
  // Low MATTR = AI-like = high AI score
  const score = Math.round(Math.max(5, Math.min(95, (1 - mattr) * 130 + 5)));
  return { score, mattr };
}

/** Signal 3 (15%): Burstiness — low std dev in sentence lengths = AI */
function computeBurstiness(sentences: string[]): {
  score: number;
  stdDev: number;
} {
  if (sentences.length < 2) return { score: 50, stdDev: 0 };
  const lengths = sentences.map(countWords);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance =
    lengths.reduce((sum, l) => sum + (l - avg) ** 2, 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  // Low std dev = AI-like = high AI score
  const score = Math.round(Math.max(0, Math.min(95, 75 - stdDev * 3.5)));
  return { score, stdDev };
}

/** Signal 4 (12%): Passive voice density — more passive = more AI */
function computePassiveVoice(
  text: string,
  sentences: string[],
): { score: number; passiveCount: number; total: number } {
  // Detect "to be + past participle": e.g. "is seen", "was written", "are considered"
  // Past participles often end in -ed, -en, -d, -t, -n but this would overfire.
  // Use: (is|are|was|were|be|been|being) + optional adverb + past participle (-ed or common irregular)
  const passiveRegex =
    /\b(is|are|was|were|be|been|being|am)\s+(?:\w+ly\s+)?\w+ed\b/gi;
  const lower = toLower(text);
  // Also match common irregular past participles
  const irregularPassives =
    /\b(is|are|was|were|be|been|being)\s+(seen|known|given|taken|made|done|said|found|gone|come|shown|told|written|read|thought|brought|kept|left|let|set|put|cut|hit|led|built|held|felt|meant|heard|understood|drawn|driven|chosen|broken|spoken|written|hidden|frozen|stolen|fallen|risen|grown|thrown|forgotten|given|begun|run|become|come)\b/gi;

  let passiveCount = 0;
  const passiveMatches = lower.match(passiveRegex) ?? [];
  const irregularMatches = lower.match(irregularPassives) ?? [];
  passiveCount = passiveMatches.length + irregularMatches.length;

  const total = sentences.length || 1;
  const ratio = passiveCount / total;
  // High passive ratio = more AI
  const score = Math.round(Math.min(95, ratio * 180 + 15));
  return { score: Math.max(5, score), passiveCount, total };
}

/** Signal 5 (10%): Contraction usage — low = more AI */
function computeContractionRate(
  lower: string,
  wordCount: number,
): { score: number; count: number } {
  let count = 0;
  for (const c of CONTRACTIONS) {
    const re = new RegExp(`\\b${c.replace("'", "'")}\\b`, "g");
    const m = lower.match(re);
    if (m) count += m.length;
  }
  if (wordCount === 0) return { score: 50, count: 0 };
  const ratio = count / wordCount;
  // Low ratio = more AI
  const score =
    ratio < 0.005
      ? 88
      : ratio < 0.01
        ? 72
        : ratio < 0.02
          ? 55
          : ratio < 0.035
            ? 38
            : ratio < 0.055
              ? 25
              : 12;
  return { score, count };
}

/** Signal 6 (8%): First-person pronoun usage — low usage = AI */
function computeFirstPerson(
  lower: string,
  wordCount: number,
): { score: number; count: number } {
  const firstPersonPattern = /\b(i|me|my|myself|mine|we|our|ours|ourselves)\b/g;
  const matches = lower.match(firstPersonPattern);
  const count = matches ? matches.length : 0;
  if (wordCount === 0) return { score: 50, count: 0 };
  const ratio = count / wordCount;
  const score =
    ratio < 0.005
      ? 85
      : ratio < 0.01
        ? 70
        : ratio < 0.02
          ? 50
          : ratio < 0.04
            ? 30
            : 15;
  return { score, count };
}

/** Signal 7 (8%): Readability grade level — AI tends toward grade 10–14 consistently */
function computeReadability(
  text: string,
  sentences: string[],
  wordCount: number,
): { score: number; grade: number } {
  if (sentences.length === 0 || wordCount === 0) return { score: 50, grade: 0 };

  // Count syllables: simple heuristic — count vowel groups
  function countSyllables(rawWord: string): number {
    let w = rawWord.toLowerCase().replace(/[^a-z]/g, "");
    if (w.length === 0) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    w = w.replace(/^y/, "");
    const syllables = w.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  }

  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  // Flesch-Kincaid Grade Level
  const asl = wordCount / sentences.length; // avg sentence length
  const asw = totalSyllables / wordCount; // avg syllables per word
  const grade = 0.39 * asl + 11.8 * asw - 15.59;

  // AI tends to write in grade 10–13 range consistently
  // Human writing varies 5–18+
  // Score: if grade in 10–13 = high AI, outside = lower
  const distFromAiRange = Math.min(
    Math.abs(grade - 10),
    Math.abs(grade - 13),
    grade >= 10 && grade <= 13 ? 0 : 999,
  );
  let score: number;
  if (grade >= 10 && grade <= 13) score = 80;
  else if (grade >= 8 && grade <= 15) score = 55;
  else score = 30;

  // High grade (> 15) = complex = could be human academic, reduce AI signal
  if (grade > 16) score = Math.max(20, score - 15);
  // Very low grade (< 6) = casual = likely human
  if (grade < 6) score = 20;

  void distFromAiRange;
  return { score, grade: Math.round(grade * 10) / 10 };
}

/** Signal 8 (5%): N-gram repetition — repeated bigrams = AI */
function computeNgramRepetition(lower: string): number {
  const words = lower.split(/\s+/).filter((w) => w.length > 1);
  if (words.length < 4) return 0;
  const bigramMap = new Map<string, number>();
  for (let i = 0; i < words.length - 1; i++) {
    const bg = `${words[i]} ${words[i + 1]}`;
    bigramMap.set(bg, (bigramMap.get(bg) ?? 0) + 1);
  }
  let repeated = 0;
  for (const count of bigramMap.values()) {
    if (count > 1) repeated += count - 1;
  }
  const density = (repeated / words.length) * 100;
  return Math.round(Math.min(90, density * 4.5));
}

/** Signal 9 (4%): Question sentence ratio — humans ask more rhetorical questions */
function computeQuestionRatio(
  text: string,
  sentences: string[],
): { score: number; qCount: number } {
  const qCount = (text.match(/\?/g) ?? []).length;
  const total = sentences.length || 1;
  const ratio = qCount / total;
  // Low question ratio = more AI (AI rarely uses rhetorical questions)
  const score = ratio < 0.03 ? 72 : ratio < 0.08 ? 50 : ratio < 0.15 ? 32 : 18;
  return { score, qCount };
}

/** Signal 10 (2%): Punctuation diversity — low variety = AI */
function computePunctuationDiversity(text: string): number {
  const punctChars = new Set<string>();
  for (const ch of text) {
    if (/[!?;:()\-–—"'…,]/.test(ch)) punctChars.add(ch);
  }
  const variety = punctChars.size;
  if (variety >= 8) return 20;
  if (variety >= 5) return 40;
  if (variety >= 3) return 58;
  if (variety >= 1) return 72;
  return 85;
}

/** Signal 11 (1%): Formal hedge phrases — more hedging = AI */
function computeFormalHedge(lower: string, wordCount: number): number {
  const FORMAL_HEDGE_PHRASES = [
    "it can be argued",
    "it could be argued",
    "one might argue",
    "one could argue",
    "it is possible that",
    "it may be the case",
    "ostensibly",
    "presumably",
    "it is generally accepted",
    "it is widely believed",
    "research suggests",
    "studies indicate",
    "evidence suggests",
    "arguably",
    "to some extent",
    "in some respects",
  ];
  let hits = 0;
  for (const phrase of FORMAL_HEDGE_PHRASES) {
    if (lower.includes(phrase)) hits++;
  }
  if (wordCount === 0) return 0;
  return Math.min(90, hits * 14);
}

// ── Per-Sentence Mini Scorer for 80% Threshold Flagging ──────────────────

/** Score a single sentence across all three model proxies, return 0–100 composite */
function scoreSentenceMini(sentence: string): number {
  const sLower = toLower(sentence);
  const wc = countWords(sentence);

  // Model A mini: phrase density + structural signals
  let phraseHits = 0;
  for (const phrase of AI_PHRASES) {
    if (sLower.includes(phrase)) phraseHits++;
  }
  const hasContraction = CONTRACTIONS.some((c) => sLower.includes(c));
  const hasFirstPerson = /\b(i|me|my|we|our)\b/.test(sLower);
  const hasPassive = /\b(is|are|was|were)\s+\w+ed\b/i.test(sentence);
  const uniformLen = wc >= 16 && wc <= 26;
  const miniA =
    Math.min(95, phraseHits * 18) * 0.5 +
    (hasContraction ? 10 : 65) * 0.2 +
    (hasFirstPerson ? 10 : 60) * 0.15 +
    (hasPassive ? 70 : 25) * 0.1 +
    (uniformLen ? 65 : 30) * 0.05;

  // Model B mini: vocabulary uniqueness in the sentence
  const words = sLower.split(/\s+/).filter((w) => w.length > 1);
  const uniqueRatio =
    words.length > 0 ? new Set(words).size / words.length : 0.5;
  const miniB = Math.max(5, Math.min(95, (1 - uniqueRatio) * 100));

  // Model C mini: passive + length signals
  const miniC =
    (hasPassive ? 75 : 20) * 0.5 +
    (hasContraction ? 10 : 70) * 0.3 +
    (uniformLen ? 60 : 25) * 0.2;

  return miniA * 0.4 + miniB * 0.35 + miniC * 0.25;
}

/** Find suspicious sentences: composite mini-score >= 80 */
function findSuspiciousSentenceIndices(sentences: string[]): number[] {
  const flagged: number[] = [];
  sentences.forEach((sentence, i) => {
    const score = scoreSentenceMini(sentence);
    if (score >= 80) flagged.push(i);
  });
  return flagged;
}

/** Build multi-model explanation with per-model rationale */
function buildMultiModelExplanation(
  aiScore: number,
  votes: ModelVotes,
  signalList: Array<{ name: string; contribution: number; detail: string }>,
  grade: number,
  flaggedCount: number,
): string {
  const lines: string[] = [];

  // Opening verdict
  const verdictPhrase =
    aiScore >= 80
      ? "All three detection models strongly indicate machine-generated text"
      : aiScore >= 65
        ? "Multiple detection models flag this content as likely AI-generated"
        : aiScore >= 50
          ? "Detection models show mixed signals between AI and human authorship"
          : "Detection models indicate this content is likely human-written";

  lines.push(`${verdictPhrase} (${aiScore}% AI probability).`);

  // Per-model breakdown
  const robertaLabel =
    votes.robertaScore >= 80
      ? "high confidence AI"
      : votes.robertaScore >= 60
        ? "moderate AI signals"
        : votes.robertaScore >= 40
          ? "mixed signals"
          : "human-like patterns";
  const gpt2Label =
    votes.gpt2Score >= 80
      ? "low perplexity (AI-predictable)"
      : votes.gpt2Score >= 60
        ? "below-average perplexity"
        : votes.gpt2Score >= 40
          ? "moderate perplexity"
          : "high perplexity (human-like)";
  const styleLabel =
    votes.stylometricScore >= 80
      ? "AI-typical writing style"
      : votes.stylometricScore >= 60
        ? "somewhat formal/AI-leaning style"
        : votes.stylometricScore >= 40
          ? "mixed stylometric markers"
          : "natural human stylometric profile";

  lines.push(
    `RoBERTa classifier: ${votes.robertaScore}% (${robertaLabel}). ` +
      `GPT-2 perplexity model: ${votes.gpt2Score}% (${gpt2Label}). ` +
      `Stylometric analysis: ${votes.stylometricScore}% (${styleLabel}).`,
  );

  // Top contributing signal
  const sorted = [...signalList].sort(
    (a, b) => b.contribution - a.contribution,
  );
  const top = sorted[0];
  if (top) {
    lines.push(
      `The strongest indicator was ${top.name} (${top.detail}), which contributed most to the final score.`,
    );
  }

  // Grade note
  if (grade > 0) {
    const gradeNote =
      grade >= 10 && grade <= 13
        ? `Readability grade ${grade} falls in the range typical of AI writing (10–13).`
        : grade > 13
          ? `High readability grade (${grade}) suggests complex academic or technical writing.`
          : `Low readability grade (${grade}) is more consistent with casual human writing.`;
    lines.push(gradeNote);
  }

  // Flagged sections note
  if (flaggedCount > 0) {
    lines.push(
      `${flaggedCount} sentence${flaggedCount > 1 ? "s were" : " was"} flagged as suspicious (composite model score ≥ 80%).`,
    );
  }

  // Closing
  if (aiScore >= 60) {
    lines.push(
      "The weighted vote of all three models is consistent with AI generation patterns such as low vocabulary variation, passive constructions, and formulaic transitions.",
    );
  } else {
    lines.push(
      "The models collectively found sufficient natural variation in sentence rhythm, personal voice, and vocabulary to lean toward human authorship.",
    );
  }

  return lines.join(" ");
}

// ── Exported Types ─────────────────────────────────────────────────────────

export interface SignalScores {
  phrase: number; // AI phrase density (high = AI)
  vocab: number; // MATTR-based vocab diversity (high = AI)
  burstiness: number; // Sentence burstiness (high = AI, low burstiness)
  passive: number; // Passive voice (high = AI)
  contractions: number; // Contraction rate (high = AI, low contractions)
  pronouns: number; // First-person pronouns (high = AI, low 1st-person)
  // Legacy fields kept for ResultCard compatibility
  sentence: number;
  ngram: number;
}

/** Per-model vote scores (0–100, high = more AI) */
export interface ModelVotes {
  robertaScore: number; // RoBERTa-style classifier (phrase + structural patterns)
  gpt2Score: number; // GPT-2 perplexity proxy (vocab, burstiness, n-gram)
  stylometricScore: number; // Stylometric analysis (passive, readability, voice)
  robertaWeight: number; // 0.40
  gpt2Weight: number; // 0.35
  stylometricWeight: number; // 0.25
}

export interface DetectionResult {
  aiScore: number;
  humanScore: number;
  verdict: string;
  highlights: string;
  explanation: string;
  signalScores: SignalScores;
  modelVotes?: ModelVotes;
}

// ── Multi-Model Voting Detection ───────────────────────────────────────────

/**
 * Model A — RoBERTa-style classifier (weight: 40%)
 * Focuses on: AI phrase density, sentence-opening patterns, hedge language,
 * absence of rhetorical questions, absence of contractions/first-person.
 * Normalizes scores 0–100.
 */
function computeModelA_RoBERTa(
  lower: string,
  wordCount: number,
  sentences: string[],
  phraseScore: number,
  hedgeScore: number,
  contractionScore: number,
  pronounScore: number,
  questionScore: number,
): number {
  // Sentence-opening AI patterns (AI frequently starts sentences with formal openers)
  const AI_OPENERS = [
    /^(furthermore|moreover|additionally|consequently|nevertheless)/i,
    /^(in conclusion|in summary|to summarize|in closing)/i,
    /^(it is (important|worth|clear|evident|notable)|it should be)/i,
    /^(this (highlights|underscores|demonstrates|illustrates|shows))/i,
    /^(one (must|should|can|might|could))/i,
    /^(the (importance|significance|role|impact|effect) of)/i,
    /^(as (previously|mentioned|noted|stated|outlined|discussed))/i,
    /^(overall|ultimately|essentially|fundamentally|broadly)/i,
  ];

  let openerHits = 0;
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    for (const re of AI_OPENERS) {
      if (re.test(trimmed)) {
        openerHits++;
        break;
      }
    }
  }
  const openerRatio = sentences.length > 0 ? openerHits / sentences.length : 0;
  const openerScore = Math.min(95, openerRatio * 200);

  // Combine: phrase density (40%), opener ratio (20%), hedge (15%),
  // no-contractions (15%), no-pronouns (10%)
  const raw =
    phraseScore * 0.4 +
    openerScore * 0.2 +
    hedgeScore * 0.15 +
    contractionScore * 0.15 +
    pronounScore * 0.1;

  void lower;
  void wordCount;
  void questionScore;

  return Math.round(Math.max(5, Math.min(95, raw)));
}

/**
 * Model B — GPT-2 Perplexity Proxy (weight: 35%)
 * Low perplexity = AI wrote it (predictable, repetitive, low vocab diversity).
 * Focuses on: MATTR (vocab diversity), n-gram repetition, sentence burstiness.
 */
function computeModelB_GPT2Perplexity(
  mattrScore: number,
  ngramScore: number,
  burstinessScore: number,
): number {
  // MATTR: low diversity → high perplexity score (60% weight)
  // N-gram repetition: repeated bigrams → low perplexity (25% weight)
  // Burstiness: uniform lengths → AI (15% weight)
  const raw = mattrScore * 0.6 + ngramScore * 0.25 + burstinessScore * 0.15;
  return Math.round(Math.max(5, Math.min(95, raw)));
}

/**
 * Model C — Stylometric Analysis (weight: 25%)
 * Focuses on: passive voice, readability grade, contraction rate,
 * first-person usage, punctuation diversity.
 */
function computeModelC_Stylometric(
  passiveScore: number,
  readabilityScore: number,
  contractionScore: number,
  pronounScore: number,
  punctScore: number,
): number {
  const raw =
    passiveScore * 0.35 +
    readabilityScore * 0.25 +
    contractionScore * 0.2 +
    pronounScore * 0.12 +
    punctScore * 0.08;
  return Math.round(Math.max(5, Math.min(95, raw)));
}

// ── Main Detection Function ─────────────────────────────────────────────────

export function detectText(text: string): DetectionResult {
  if (text.trim().length < 20) {
    const emptyVotes: ModelVotes = {
      robertaScore: 50,
      gpt2Score: 50,
      stylometricScore: 50,
      robertaWeight: 0.4,
      gpt2Weight: 0.35,
      stylometricWeight: 0.25,
    };
    return {
      aiScore: 50,
      humanScore: 50,
      verdict: "Inconclusive",
      highlights: "",
      explanation:
        "Not enough text to analyze. Please provide at least a few sentences.",
      signalScores: {
        phrase: 50,
        vocab: 50,
        sentence: 50,
        burstiness: 50,
        ngram: 50,
        pronouns: 50,
        passive: 50,
        contractions: 50,
      },
      modelVotes: emptyVotes,
    };
  }

  const lower = toLower(text);
  const wordCount = countWords(text);
  const sentences = splitSentences(text);

  // ── Compute all base signals ──────────────────────────────────────────
  const { score: phraseScore, hitCount: phraseHits } = computePhraseDensity(
    lower,
    wordCount,
  );
  const { score: mattrScore, mattr } = computeMATTR(text);
  const { score: burstinessScore, stdDev } = computeBurstiness(sentences);
  const { score: passiveScore, passiveCount } = computePassiveVoice(
    text,
    sentences,
  );
  const { score: contractionScore, count: contractionCount } =
    computeContractionRate(lower, wordCount);
  const { score: pronounScore, count: firstPersonCount } = computeFirstPerson(
    lower,
    wordCount,
  );
  const { score: readabilityScore, grade } = computeReadability(
    text,
    sentences,
    wordCount,
  );
  const ngramScore = computeNgramRepetition(lower);
  const questionScore = computeQuestionRatio(text, sentences).score;
  const punctScore = computePunctuationDiversity(text);
  const hedgeScore = computeFormalHedge(lower, wordCount);

  // ── Three model votes ─────────────────────────────────────────────────
  const robertaScore = computeModelA_RoBERTa(
    lower,
    wordCount,
    sentences,
    phraseScore,
    hedgeScore,
    contractionScore,
    pronounScore,
    questionScore,
  );
  const gpt2Score = computeModelB_GPT2Perplexity(
    mattrScore,
    ngramScore,
    burstinessScore,
  );
  const stylometricScore = computeModelC_Stylometric(
    passiveScore,
    readabilityScore,
    contractionScore,
    pronounScore,
    punctScore,
  );

  const MODEL_WEIGHTS = { roberta: 0.4, gpt2: 0.35, stylometric: 0.25 };

  // ── Weighted average of three model votes ─────────────────────────────
  const rawCombined =
    robertaScore * MODEL_WEIGHTS.roberta +
    gpt2Score * MODEL_WEIGHTS.gpt2 +
    stylometricScore * MODEL_WEIGHTS.stylometric;

  const aiScore = sigmoid(rawCombined);
  const humanScore = 100 - aiScore;
  const verdict =
    aiScore >= 60 ? "Likely AI-Generated" : "Likely Human-Written";

  const modelVotes: ModelVotes = {
    robertaScore,
    gpt2Score,
    stylometricScore,
    robertaWeight: MODEL_WEIGHTS.roberta,
    gpt2Weight: MODEL_WEIGHTS.gpt2,
    stylometricWeight: MODEL_WEIGHTS.stylometric,
  };

  // ── Flag suspicious sentences (composite score ≥ 80) ─────────────────
  const flaggedIndices = findSuspiciousSentenceIndices(sentences);
  const highlights = flaggedIndices.join(",");

  // ── Signal list for explanation ───────────────────────────────────────
  const signalList = [
    {
      name: "AI phrase density",
      contribution: phraseScore,
      detail: `${phraseHits} match${phraseHits !== 1 ? "es" : ""}`,
    },
    {
      name: "low vocabulary variation",
      contribution: mattrScore,
      detail: `${Math.round(mattr * 100)}% moving-window TTR`,
    },
    {
      name: "sentence uniformity",
      contribution: burstinessScore,
      detail: `std dev ${stdDev.toFixed(1)} words`,
    },
    {
      name: "passive voice usage",
      contribution: passiveScore,
      detail: `${passiveCount} passive construction${passiveCount !== 1 ? "s" : ""}`,
    },
    {
      name: "minimal contractions",
      contribution: contractionScore,
      detail: `${contractionCount} contraction${contractionCount !== 1 ? "s" : ""} found`,
    },
    {
      name: "minimal personal voice",
      contribution: pronounScore,
      detail: `${firstPersonCount} first-person pronoun${firstPersonCount !== 1 ? "s" : ""}`,
    },
  ];

  const explanation = buildMultiModelExplanation(
    aiScore,
    modelVotes,
    signalList,
    grade,
    flaggedIndices.length,
  );

  return {
    aiScore,
    humanScore,
    verdict,
    highlights,
    explanation,
    signalScores: {
      phrase: phraseScore,
      vocab: mattrScore,
      sentence: readabilityScore,
      burstiness: burstinessScore,
      ngram: ngramScore,
      pronouns: pronounScore,
      passive: passiveScore,
      contractions: contractionScore,
    },
    modelVotes,
  };
}

// ── Image Analysis ─────────────────────────────────────────────────────────

/**
 * Analyze a 64×64 canvas sample for:
 *  - Color smoothness (AI images are often unnaturally smooth)
 *  - Gradient regularity (AI tends to produce smooth gradient regions)
 *  - Edge regularity (AI has very clean edges vs natural camera noise)
 *  - Local contrast uniformity (photographic images have non-uniform contrast)
 *  - Shannon entropy of quantized pixel histogram
 */
interface PixelAnalysis {
  smoothnessScore: number; // high = smooth = more AI
  edgeScore: number; // high = unnaturally clean edges = more AI
  gradientScore: number; // high = suspiciously regular gradients = more AI
  contrastUniformity: number; // high = uniform contrast = more AI
  entropyScore: number; // high = perfectly distributed colors = more AI
  colorConsistency: number; // high = suspiciously consistent saturation = more AI
  noiseScore: number; // high = lack of natural sensor noise = more AI
}

async function analyzePixels(file: File): Promise<PixelAnalysis> {
  const SIZE = 64; // analyze at 64×64 for better accuracy
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const fallback: PixelAnalysis = {
    smoothnessScore: 50,
    edgeScore: 50,
    gradientScore: 50,
    contrastUniformity: 50,
    entropyScore: 50,
    colorConsistency: 50,
    noiseScore: 50,
  };

  if (!ctx) return fallback;

  try {
    const tmpUrl = URL.createObjectURL(file);
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        resolve();
      };
      img.onerror = () => reject(new Error("load fail"));
      img.src = tmpUrl;
      setTimeout(() => reject(new Error("timeout")), 8000);
    });
    URL.revokeObjectURL(tmpUrl);
  } catch {
    return fallback;
  }

  const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

  // Helper: luminance of pixel at (x,y)
  const lum = (x: number, y: number): number => {
    const i = (y * SIZE + x) * 4;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };

  // Helper: saturation of pixel
  const sat = (x: number, y: number): number => {
    const i = (y * SIZE + x) * 4;
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return max === 0 ? 0 : (max - min) / max;
  };

  // 1. Smoothness: measure average absolute difference between adjacent pixels
  //    Real photos have natural grain; AI images are suspiciously smooth
  let totalDiff = 0;
  let diffCount = 0;
  for (let y = 0; y < SIZE - 1; y++) {
    for (let x = 0; x < SIZE - 1; x++) {
      const d1 = Math.abs(lum(x, y) - lum(x + 1, y));
      const d2 = Math.abs(lum(x, y) - lum(x, y + 1));
      totalDiff += d1 + d2;
      diffCount += 2;
    }
  }
  const avgDiff = totalDiff / diffCount; // natural photos: ~15–40, AI: ~5–20
  // Low avg diff = smooth = AI-like
  const smoothnessScore = Math.round(
    Math.max(5, Math.min(90, 85 - avgDiff * 1.8)),
  );

  // 2. Edge regularity: variance of differences — natural photos have high variance
  //    AI images have very consistent, predictable edge sharpness
  const diffs: number[] = [];
  for (let y = 0; y < SIZE - 1; y++) {
    for (let x = 0; x < SIZE - 1; x++) {
      diffs.push(Math.abs(lum(x, y) - lum(x + 1, y)));
    }
  }
  const diffMean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const diffVariance =
    diffs.reduce((s, d) => s + (d - diffMean) ** 2, 0) / diffs.length;
  const diffStdDev = Math.sqrt(diffVariance);
  // Low std dev = uniform edge strength = AI (photos have wild variance)
  const edgeScore = Math.round(
    Math.max(5, Math.min(90, 82 - diffStdDev * 2.2)),
  );

  // 3. Gradient regularity: measure diagonal gradient consistency in 4×4 blocks
  //    AI images often have very smooth, regular gradient transitions
  let gradientReg = 0;
  let blockCount = 0;
  for (let by = 0; by < SIZE - 4; by += 4) {
    for (let bx = 0; bx < SIZE - 4; bx += 4) {
      const corners = [
        lum(bx, by),
        lum(bx + 3, by),
        lum(bx, by + 3),
        lum(bx + 3, by + 3),
      ];
      const diagDiff1 = Math.abs(corners[0] - corners[3]);
      const diagDiff2 = Math.abs(corners[1] - corners[2]);
      // If both diagonals are nearly equal, it's a regular gradient (AI signal)
      const symmetry = Math.abs(diagDiff1 - diagDiff2);
      gradientReg += symmetry < 8 ? 1 : 0;
      blockCount++;
    }
  }
  const gradientRegRatio = blockCount > 0 ? gradientReg / blockCount : 0.5;
  // High regularity = AI
  const gradientScore = Math.round(gradientRegRatio * 80 + 10);

  // 4. Local contrast uniformity: compute contrast in 8×8 blocks, measure std dev
  //    AI images have suspiciously similar contrast across blocks
  const blockContrasts: number[] = [];
  for (let by = 0; by < SIZE - 8; by += 8) {
    for (let bx = 0; bx < SIZE - 8; bx += 8) {
      let bMin = 255;
      let bMax = 0;
      for (let dy = 0; dy < 8; dy++) {
        for (let dx = 0; dx < 8; dx++) {
          const l = lum(bx + dx, by + dy);
          if (l < bMin) bMin = l;
          if (l > bMax) bMax = l;
        }
      }
      blockContrasts.push(bMax - bMin);
    }
  }
  const bcMean =
    blockContrasts.reduce((a, b) => a + b, 0) / blockContrasts.length;
  const bcVariance =
    blockContrasts.reduce((s, c) => s + (c - bcMean) ** 2, 0) /
    blockContrasts.length;
  const bcStdDev = Math.sqrt(bcVariance);
  // Low std dev of block contrasts = uniform = AI
  const contrastUniformity = Math.round(
    Math.max(5, Math.min(90, 85 - bcStdDev * 1.2)),
  );

  // 5. Shannon entropy of quantized luminance histogram (32 bins)
  const histogram = new Array(32).fill(0);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const bin = Math.min(31, Math.floor(lum(x, y) / 8));
      histogram[bin]++;
    }
  }
  const totalPx = SIZE * SIZE;
  let shannonEntropy = 0;
  for (const count of histogram) {
    if (count > 0) {
      const p = count / totalPx;
      shannonEntropy -= p * Math.log2(p);
    }
  }
  // Max entropy = log2(32) ≈ 5. AI images tend toward high entropy (4–5) = "perfectly distributed"
  // Very low entropy = mostly one color (graphic/logo) — not AI portrait/scene
  const normalizedEntropy = shannonEntropy / 5;
  // Mid-high entropy (0.75–0.95) is most AI-like; too high or too low = less AI
  let entropyScore: number;
  if (normalizedEntropy >= 0.75 && normalizedEntropy <= 0.95) entropyScore = 70;
  else if (normalizedEntropy >= 0.6 && normalizedEntropy < 0.75)
    entropyScore = 55;
  else if (normalizedEntropy > 0.95)
    entropyScore = 40; // very uniform = photographic
  else entropyScore = 30; // low = graphic/logo

  // 6. Color consistency (saturation uniformity): AI images have suspiciously even saturation
  const saturations: number[] = [];
  for (let y = 0; y < SIZE; y += 2) {
    for (let x = 0; x < SIZE; x += 2) {
      saturations.push(sat(x, y));
    }
  }
  const satMean = saturations.reduce((a, b) => a + b, 0) / saturations.length;
  const satVariance =
    saturations.reduce((s, sv) => s + (sv - satMean) ** 2, 0) /
    saturations.length;
  const satStdDev = Math.sqrt(satVariance);
  // Low saturation std dev = uniform saturation = AI
  const colorConsistency = Math.round(
    Math.max(5, Math.min(90, 78 - satStdDev * 120)),
  );

  // 7. Noise analysis: high-frequency noise in a uniform region = camera sensor noise = human
  //    Compare the darkest 10% of pixels for local variance
  const darkPixels: number[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const l = lum(x, y);
      if (l < 60) darkPixels.push(l);
    }
  }
  let noiseScore = 50;
  if (darkPixels.length >= 10) {
    const nMean = darkPixels.reduce((a, b) => a + b, 0) / darkPixels.length;
    const nVar =
      darkPixels.reduce((s, v) => s + (v - nMean) ** 2, 0) / darkPixels.length;
    const nStdDev = Math.sqrt(nVar);
    // Real cameras: nStdDev in shadows ≈ 3–12; AI: 0.5–3
    noiseScore = Math.round(Math.max(5, Math.min(90, 82 - nStdDev * 6)));
  }

  return {
    smoothnessScore,
    edgeScore,
    gradientScore,
    contrastUniformity,
    entropyScore,
    colorConsistency,
    noiseScore,
  };
}

/** Async image analysis using multi-signal pixel forensics + metadata heuristics */
export async function analyzeImageFile(file: File): Promise<DetectionResult> {
  const filename = toLower(file.name);

  // Filename keyword signal
  let filenameHits = 0;
  for (const kw of AI_IMAGE_KEYWORDS) {
    if (filename.includes(kw)) filenameHits++;
  }
  const filenameScore =
    filenameHits > 0 ? Math.min(90, 40 + filenameHits * 25) : 15;

  // File extension — AI generators produce webp/png more than jpeg
  const ext = filename.split(".").pop() ?? "";
  const extScore =
    ext === "webp"
      ? 65
      : ext === "png"
        ? 58
        : ext === "jpg" || ext === "jpeg"
          ? 42
          : 50;

  let width = 0;
  let height = 0;
  let aspectRatioScore = 40;

  // Load image dimensions
  try {
    const url = URL.createObjectURL(file);
    const dims = await new Promise<{ w: number; h: number }>(
      (resolve, reject) => {
        const img = new Image();
        img.onload = () =>
          resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => reject(new Error("Cannot load image"));
        img.src = url;
        setTimeout(() => reject(new Error("timeout")), 5000);
      },
    );
    width = dims.w;
    height = dims.h;
    URL.revokeObjectURL(url);

    // Aspect ratio signal — common AI generator canvas sizes
    const ratio = width / height;
    const knownAiRatios = [
      1.0,
      16 / 9,
      9 / 16,
      4 / 3,
      3 / 4,
      3 / 2,
      2 / 3,
      21 / 9,
    ];
    const isRoundRatio = knownAiRatios.some((r) => Math.abs(ratio - r) < 0.03);
    // AI generators almost always output power-of-2 or fixed canvas sizes
    const aiDims = [
      256, 384, 512, 640, 768, 832, 896, 960, 1024, 1152, 1280, 1344, 1408,
      1472, 1536, 2048,
    ];
    const isAiDim = aiDims.includes(width) || aiDims.includes(height);
    aspectRatioScore =
      isRoundRatio && isAiDim ? 85 : isRoundRatio ? 62 : isAiDim ? 68 : 30;
  } catch {
    // Fallback if dimension loading fails
  }

  // File size heuristic — AI images at same resolution tend to be smaller (less noise = better compression)
  const fileSizeMB = file.size / (1024 * 1024);
  let fileSizeScore = 45;
  if (width > 0 && height > 0) {
    const megapixels = (width * height) / 1_000_000;
    const bytesPerPixel = file.size / (width * height);
    // Real JPEG photos: ~2–5 bytes/pixel; AI images: ~0.5–2 bytes/pixel
    fileSizeScore =
      bytesPerPixel < 0.6
        ? 78
        : bytesPerPixel < 1.2
          ? 65
          : bytesPerPixel < 2.5
            ? 48
            : bytesPerPixel < 4.0
              ? 32
              : 22;
    void megapixels;
  } else {
    fileSizeScore = fileSizeMB < 0.08 ? 68 : fileSizeMB > 6 ? 25 : 45;
  }

  // Deep pixel analysis
  const px = await analyzePixels(file);

  // Weighted combination — pixel signals get 55% combined weight
  // Filename carries less weight (10%) since AI images often have generic names
  const raw =
    px.smoothnessScore * 0.12 +
    px.edgeScore * 0.12 +
    px.gradientScore * 0.08 +
    px.contrastUniformity * 0.08 +
    px.noiseScore * 0.1 +
    px.colorConsistency * 0.05 +
    px.entropyScore * 0.05 +
    aspectRatioScore * 0.18 +
    fileSizeScore * 0.12 +
    extScore * 0.05 +
    filenameScore * 0.05;

  // Boost: if multiple strong pixel signals agree, push harder toward AI
  const pixelSignals = [
    px.smoothnessScore,
    px.edgeScore,
    px.noiseScore,
    px.contrastUniformity,
  ];
  const strongPixelAI = pixelSignals.filter((s) => s >= 65).length;
  const boost = strongPixelAI >= 3 ? 8 : strongPixelAI >= 2 ? 4 : 0;

  const aiScoreRaw = Math.min(95, raw + boost);
  const aiScore = sigmoid(aiScoreRaw);
  const humanScore = 100 - aiScore;
  const verdict =
    aiScore >= 55 ? "Likely AI-Generated" : "Likely Human-Written";

  // Explanation
  const dimNote =
    width > 0 && height > 0
      ? `Image dimensions ${width}×${height}${aspectRatioScore >= 68 ? " (matches common AI generator canvas sizes)" : ""}. `
      : "";
  const smoothNote =
    px.smoothnessScore >= 65
      ? "Pixel smoothness is unusually high, consistent with AI generation. "
      : px.smoothnessScore <= 35
        ? "Natural pixel noise detected, consistent with camera photography. "
        : "";
  const noiseNote =
    px.noiseScore >= 65
      ? "Lack of sensor noise in dark regions suggests synthetic generation. "
      : px.noiseScore <= 35
        ? "Natural shadow noise detected, typical of real photographs. "
        : "";
  const edgeNote =
    px.edgeScore >= 65
      ? "Edge uniformity is atypically regular, a hallmark of AI-generated imagery. "
      : "";
  const filenameNote =
    filenameHits > 0
      ? `Filename contains AI-associated term${filenameHits > 1 ? "s" : ""}. `
      : "";
  const sizeNote =
    fileSizeScore >= 65
      ? "Low bytes-per-pixel ratio suggests high compression efficiency, common in AI images. "
      : fileSizeScore <= 30
        ? "High bytes-per-pixel ratio is typical of real photographic content. "
        : "";

  const explanation =
    `${dimNote}${smoothNote}${noiseNote}${edgeNote}${sizeNote}${filenameNote}Overall confidence: ${aiScore}% AI. Manual verification recommended for definitive judgment.`.trim();

  return {
    aiScore,
    humanScore,
    verdict,
    highlights: "",
    explanation,
    signalScores: {
      phrase: filenameScore,
      vocab: px.smoothnessScore,
      sentence: aspectRatioScore,
      burstiness: px.noiseScore,
      ngram: px.edgeScore,
      pronouns: px.colorConsistency,
      passive: fileSizeScore,
      contractions: px.gradientScore,
    },
  };
}

// ── Video Analysis ─────────────────────────────────────────────────────────

/**
 * Extract an ImageData frame from a video at a given time using a canvas.
 */
async function extractVideoFrame(
  videoEl: HTMLVideoElement,
  timeSeconds: number,
  size: number,
): Promise<PixelAnalysis> {
  const fallback: PixelAnalysis = {
    smoothnessScore: 50,
    edgeScore: 50,
    gradientScore: 50,
    contrastUniformity: 50,
    entropyScore: 50,
    colorConsistency: 50,
    noiseScore: 50,
  };

  return new Promise<PixelAnalysis>((resolve) => {
    const seekTimeout = setTimeout(() => resolve(fallback), 6000);

    videoEl.currentTime = timeSeconds;
    videoEl.onseeked = async () => {
      clearTimeout(seekTimeout);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(fallback);
          return;
        }
        ctx.drawImage(videoEl, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // Luminance helper
        const lum = (x: number, y: number): number => {
          const i = (y * size + x) * 4;
          return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        };

        // Saturation helper
        const sat = (x: number, y: number): number => {
          const i = (y * size + x) * 4;
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          return max === 0 ? 0 : (max - min) / max;
        };

        // 1. Smoothness
        let totalDiff = 0;
        let diffCount = 0;
        for (let y = 0; y < size - 1; y++) {
          for (let x = 0; x < size - 1; x++) {
            totalDiff +=
              Math.abs(lum(x, y) - lum(x + 1, y)) +
              Math.abs(lum(x, y) - lum(x, y + 1));
            diffCount += 2;
          }
        }
        const avgDiff = totalDiff / diffCount;
        const smoothnessScore = Math.round(
          Math.max(5, Math.min(90, 85 - avgDiff * 1.8)),
        );

        // 2. Edge regularity
        const diffs: number[] = [];
        for (let y = 0; y < size - 1; y++) {
          for (let x = 0; x < size - 1; x++) {
            diffs.push(Math.abs(lum(x, y) - lum(x + 1, y)));
          }
        }
        const diffMean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        const diffVariance =
          diffs.reduce((s, d) => s + (d - diffMean) ** 2, 0) / diffs.length;
        const edgeScore = Math.round(
          Math.max(5, Math.min(90, 82 - Math.sqrt(diffVariance) * 2.2)),
        );

        // 3. Gradient regularity
        let gradientReg = 0;
        let blockCount = 0;
        for (let by = 0; by < size - 4; by += 4) {
          for (let bx = 0; bx < size - 4; bx += 4) {
            const c = [
              lum(bx, by),
              lum(bx + 3, by),
              lum(bx, by + 3),
              lum(bx + 3, by + 3),
            ];
            if (Math.abs(Math.abs(c[0] - c[3]) - Math.abs(c[1] - c[2])) < 8)
              gradientReg++;
            blockCount++;
          }
        }
        const gradientScore = Math.round(
          (blockCount > 0 ? gradientReg / blockCount : 0.5) * 80 + 10,
        );

        // 4. Contrast uniformity
        const blockContrasts: number[] = [];
        for (let by = 0; by < size - 8; by += 8) {
          for (let bx = 0; bx < size - 8; bx += 8) {
            let bMin = 255;
            let bMax = 0;
            for (let dy = 0; dy < 8; dy++) {
              for (let dx = 0; dx < 8; dx++) {
                const l = lum(bx + dx, by + dy);
                if (l < bMin) bMin = l;
                if (l > bMax) bMax = l;
              }
            }
            blockContrasts.push(bMax - bMin);
          }
        }
        const bcMean =
          blockContrasts.reduce((a, b) => a + b, 0) / blockContrasts.length;
        const bcStdDev = Math.sqrt(
          blockContrasts.reduce((s, c) => s + (c - bcMean) ** 2, 0) /
            blockContrasts.length,
        );
        const contrastUniformity = Math.round(
          Math.max(5, Math.min(90, 85 - bcStdDev * 1.2)),
        );

        // 5. Entropy
        const histogram = new Array(32).fill(0);
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            histogram[Math.min(31, Math.floor(lum(x, y) / 8))]++;
          }
        }
        const totalPx = size * size;
        let shannonEntropy = 0;
        for (const count of histogram) {
          if (count > 0) {
            const p = count / totalPx;
            shannonEntropy -= p * Math.log2(p);
          }
        }
        const ne = shannonEntropy / 5;
        const entropyScore =
          ne >= 0.75 && ne <= 0.95
            ? 70
            : ne >= 0.6 && ne < 0.75
              ? 55
              : ne > 0.95
                ? 40
                : 30;

        // 6. Color consistency
        const saturations: number[] = [];
        for (let y = 0; y < size; y += 2) {
          for (let x = 0; x < size; x += 2) {
            saturations.push(sat(x, y));
          }
        }
        const satMean =
          saturations.reduce((a, b) => a + b, 0) / saturations.length;
        const satStdDev = Math.sqrt(
          saturations.reduce((s, sv) => s + (sv - satMean) ** 2, 0) /
            saturations.length,
        );
        const colorConsistency = Math.round(
          Math.max(5, Math.min(90, 78 - satStdDev * 120)),
        );

        // 7. Noise
        const darkPixels: number[] = [];
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const l = lum(x, y);
            if (l < 60) darkPixels.push(l);
          }
        }
        let noiseScore = 50;
        if (darkPixels.length >= 10) {
          const nMean =
            darkPixels.reduce((a, b) => a + b, 0) / darkPixels.length;
          const nStdDev = Math.sqrt(
            darkPixels.reduce((s, v) => s + (v - nMean) ** 2, 0) /
              darkPixels.length,
          );
          noiseScore = Math.round(Math.max(5, Math.min(90, 82 - nStdDev * 6)));
        }

        resolve({
          smoothnessScore,
          edgeScore,
          gradientScore,
          contrastUniformity,
          entropyScore,
          colorConsistency,
          noiseScore,
        });
      } catch {
        resolve(fallback);
      }
    };
  });
}

/** Average pixel analysis across multiple frames */
function averagePixelAnalysis(frames: PixelAnalysis[]): PixelAnalysis {
  if (frames.length === 0) {
    return {
      smoothnessScore: 50,
      edgeScore: 50,
      gradientScore: 50,
      contrastUniformity: 50,
      entropyScore: 50,
      colorConsistency: 50,
      noiseScore: 50,
    };
  }
  const avg = (key: keyof PixelAnalysis) =>
    Math.round(frames.reduce((sum, f) => sum + f[key], 0) / frames.length);
  return {
    smoothnessScore: avg("smoothnessScore"),
    edgeScore: avg("edgeScore"),
    gradientScore: avg("gradientScore"),
    contrastUniformity: avg("contrastUniformity"),
    entropyScore: avg("entropyScore"),
    colorConsistency: avg("colorConsistency"),
    noiseScore: avg("noiseScore"),
  };
}

/** Async video analysis using frame sampling + metadata heuristics */
export async function analyzeVideoFile(file: File): Promise<DetectionResult> {
  const filename = toLower(file.name);
  const ext = filename.split(".").pop() ?? "";

  // Filename keyword signal
  let filenameHits = 0;
  for (const kw of AI_VIDEO_KEYWORDS) {
    if (filename.includes(kw)) filenameHits++;
  }
  const filenameScore =
    filenameHits > 0 ? Math.min(90, 35 + filenameHits * 20) : 15;

  // Extension scoring
  const extScore =
    ext === "webm"
      ? 58
      : ext === "mp4"
        ? 50
        : ext === "mov"
          ? 42
          : ext === "avi"
            ? 35
            : ext === "mkv"
              ? 40
              : 50;

  // Load video metadata and extract frames
  let duration = 0;
  let videoWidth = 0;
  let videoHeight = 0;
  let frameAnalysis: PixelAnalysis = {
    smoothnessScore: 50,
    edgeScore: 50,
    gradientScore: 50,
    contrastUniformity: 50,
    entropyScore: 50,
    colorConsistency: 50,
    noiseScore: 50,
  };

  const SIZE = 64;
  const videoUrl = URL.createObjectURL(file);

  try {
    const videoEl = document.createElement("video");
    videoEl.muted = true;
    videoEl.preload = "metadata";
    videoEl.src = videoUrl;

    // Wait for metadata
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("metadata timeout")), 8000);
      videoEl.onloadedmetadata = () => {
        clearTimeout(t);
        resolve();
      };
      videoEl.onerror = () => {
        clearTimeout(t);
        reject(new Error("video load error"));
      };
    });

    duration = videoEl.duration;
    videoWidth = videoEl.videoWidth;
    videoHeight = videoEl.videoHeight;

    // Extract 2-3 frames: first, middle, last (if duration > 2s)
    const frameTimes: number[] = [0.1];
    if (duration > 2) frameTimes.push(duration / 2);
    if (duration > 4) frameTimes.push(Math.max(0, duration - 0.5));

    const frames = await Promise.all(
      frameTimes.map((t) => extractVideoFrame(videoEl, t, SIZE)),
    );
    frameAnalysis = averagePixelAnalysis(frames);

    videoEl.src = "";
  } catch {
    // Fallback — use file-level signals only
  } finally {
    URL.revokeObjectURL(videoUrl);
  }

  // Duration signal: AI generators often produce short 3–15s clips
  let durationScore = 45;
  if (duration > 0) {
    if (duration >= 3 && duration <= 15) durationScore = 78;
    else if (duration > 15 && duration <= 30) durationScore = 58;
    else if (duration > 30 && duration <= 60) durationScore = 42;
    else if (duration > 60) durationScore = 28;
    else if (duration < 3) durationScore = 62; // Very short
  }

  // Dimension signal: AI video generators use specific canvas sizes
  const aiVideoDims = [512, 576, 640, 720, 768, 1024, 1080, 1280, 1920];
  const isAiDim =
    videoWidth > 0 &&
    (aiVideoDims.includes(videoWidth) || aiVideoDims.includes(videoHeight));
  const dimScore = isAiDim ? 72 : videoWidth > 0 ? 35 : 50;

  // Bitrate estimation: file.size (bytes) / duration (seconds)
  // Low bitrate-per-pixel signals synthetic content (less noise = better compression)
  let bitrateScore = 45;
  if (duration > 0 && videoWidth > 0 && videoHeight > 0) {
    const bitsPerSecond = (file.size * 8) / duration;
    const megapixels = (videoWidth * videoHeight) / 1_000_000;
    const bitsPerSecondPerMegapixel = bitsPerSecond / megapixels;
    // Real camera video: 5M–20M bits/s per MP; AI video: 0.5M–5M bits/s per MP
    bitrateScore =
      bitsPerSecondPerMegapixel < 800_000
        ? 80
        : bitsPerSecondPerMegapixel < 2_000_000
          ? 65
          : bitsPerSecondPerMegapixel < 5_000_000
            ? 48
            : bitsPerSecondPerMegapixel < 12_000_000
              ? 33
              : 20;
  }

  // Weighted combination
  const raw =
    frameAnalysis.smoothnessScore * 0.12 +
    frameAnalysis.edgeScore * 0.1 +
    frameAnalysis.gradientScore * 0.06 +
    frameAnalysis.contrastUniformity * 0.08 +
    frameAnalysis.noiseScore * 0.1 +
    frameAnalysis.colorConsistency * 0.04 +
    frameAnalysis.entropyScore * 0.04 +
    durationScore * 0.2 +
    dimScore * 0.12 +
    bitrateScore * 0.08 +
    extScore * 0.03 +
    filenameScore * 0.03;

  // Boost if multiple pixel signals agree strongly
  const pixelSignals = [
    frameAnalysis.smoothnessScore,
    frameAnalysis.edgeScore,
    frameAnalysis.noiseScore,
    frameAnalysis.contrastUniformity,
  ];
  const strongPixelAI = pixelSignals.filter((s) => s >= 65).length;
  const boost = strongPixelAI >= 3 ? 7 : strongPixelAI >= 2 ? 3 : 0;

  const aiScoreRaw = Math.min(95, raw + boost);
  const aiScore = sigmoid(aiScoreRaw);
  const humanScore = 100 - aiScore;
  const verdict =
    aiScore >= 55 ? "Likely AI-Generated" : "Likely Human-Written";

  // Build explanation
  const durationNote =
    duration > 0
      ? `Duration: ${duration.toFixed(1)}s${durationScore >= 70 ? " (short clips are a common AI video generator output)" : durationScore >= 55 ? " (medium length, could be AI or human)" : " (longer video, more consistent with human-recorded content)"}. `
      : "";
  const dimNote =
    videoWidth > 0 && videoHeight > 0
      ? `Dimensions: ${videoWidth}×${videoHeight}${isAiDim ? " (matches standard AI video generator resolution)" : ""}. `
      : "";
  const bitrateNote =
    bitrateScore >= 65
      ? "Low bitrate-per-pixel suggests high compression efficiency, common in AI-synthesized video. "
      : bitrateScore <= 30
        ? "High bitrate is typical of real camera recordings. "
        : "";
  const frameNote =
    frameAnalysis.smoothnessScore >= 65
      ? "Frame analysis shows unusually smooth pixel transitions, consistent with AI generation. "
      : frameAnalysis.smoothnessScore <= 35
        ? "Natural pixel grain detected in frames, consistent with real camera footage. "
        : "";
  const filenameNote =
    filenameHits > 0
      ? `Filename contains AI video tool keyword${filenameHits > 1 ? "s" : ""}. `
      : "";

  const explanation =
    `${durationNote}${dimNote}${bitrateNote}${frameNote}${filenameNote}Overall confidence: ${aiScore}% AI. Manual review recommended.`.trim();

  return {
    aiScore,
    humanScore,
    verdict,
    highlights: "",
    explanation,
    signalScores: {
      phrase: filenameScore,
      vocab: frameAnalysis.smoothnessScore,
      sentence: dimScore,
      burstiness: frameAnalysis.noiseScore,
      ngram: frameAnalysis.edgeScore,
      pronouns: durationScore,
      passive: bitrateScore,
      contractions: frameAnalysis.gradientScore,
    },
  };
}

/** Sync file detection (falls back to text detection if snippet is long enough) */
export function detectFile(filename: string, snippet: string): DetectionResult {
  if (snippet && snippet.trim().length > 50) {
    return detectText(snippet);
  }

  const lower = toLower(filename);
  let hits = 0;
  for (const kw of AI_IMAGE_KEYWORDS) {
    if (lower.includes(kw)) hits++;
  }

  const aiScore = sigmoid(hits > 0 ? Math.min(80, 40 + hits * 15) : 28);
  const humanScore = 100 - aiScore;
  const verdict =
    aiScore >= 60 ? "Likely AI-Generated" : "Likely Human-Written";
  const explanation =
    hits > 0
      ? `Filename contains AI-associated terms (${aiScore}% AI score). Manual verification recommended.`
      : `No strong AI signals detected in filename (${aiScore}% AI score). Content appears likely human-created.`;

  return {
    aiScore,
    humanScore,
    verdict,
    highlights: "",
    explanation,
    signalScores: {
      phrase: hits > 0 ? 70 : 20,
      vocab: 50,
      sentence: 50,
      burstiness: 50,
      ngram: 50,
      pronouns: 50,
      passive: 50,
      contractions: 50,
    },
  };
}

/** Async file detection — uses canvas-based image/video analysis for media files */
export async function detectFileAsync(
  filename: string,
  snippet: string,
  file?: File,
): Promise<DetectionResult> {
  if (file) {
    if (file.type.startsWith("image/")) {
      return analyzeImageFile(file);
    }
    if (file.type.startsWith("video/")) {
      return analyzeVideoFile(file);
    }
  }
  if (snippet && snippet.trim().length > 50) {
    return detectText(snippet);
  }
  return detectFile(filename, snippet);
}

// Keep legacy TO_BE_FORMS export reference for tree-shaking
void TO_BE_FORMS;
