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

/** Find suspicious sentences: 3+ AI signals hit on the sentence */
function findSuspiciousSentenceIndices(sentences: string[]): number[] {
  const flagged: number[] = [];
  sentences.forEach((sentence, i) => {
    const sLower = toLower(sentence);
    let hits = 0;

    // Phrase hits
    for (const phrase of AI_PHRASES) {
      if (sLower.includes(phrase)) {
        hits++;
        if (hits >= 2) break; // cap contribution at 2
      }
    }

    // No contraction = +1
    let hasContraction = false;
    for (const c of CONTRACTIONS) {
      if (sLower.includes(c)) {
        hasContraction = true;
        break;
      }
    }
    if (!hasContraction) hits++;

    // Passive voice = +1
    if (/\b(is|are|was|were)\s+\w+ed\b/i.test(sentence)) hits++;

    // No first-person = +1
    if (!/\b(i|me|my|we|our)\b/.test(sLower)) hits++;

    // Too-uniform sentence length
    const wc = countWords(sentence);
    if (wc >= 16 && wc <= 26) hits++;

    if (hits >= 4) flagged.push(i);
  });
  return flagged;
}

/** Build rich explanation citing top 3 signals */
function buildExplanation(
  aiScore: number,
  signals: Array<{ name: string; contribution: number; detail: string }>,
  grade: number,
): string {
  const sorted = [...signals].sort((a, b) => b.contribution - a.contribution);
  const top3 = sorted.slice(0, 3);

  const verdictPhrase =
    aiScore >= 75
      ? "strongly suggest machine-generated text"
      : aiScore >= 60
        ? "suggest likely AI-generated content"
        : aiScore >= 45
          ? "indicate mixed signals between AI and human writing"
          : "suggest mostly human-written content";

  const signalDescs = top3
    .map((s, i) => {
      const prefix =
        i === 0 ? s.name.charAt(0).toUpperCase() + s.name.slice(1) : s.name;
      return `${prefix} (${s.detail})`;
    })
    .join(", ");

  const lines = [`${signalDescs} ${verdictPhrase}.`];

  if (grade > 0) {
    const gradeNote =
      grade >= 10 && grade <= 13
        ? `Readability grade ${grade} falls in the range typical of AI writing (10–13).`
        : grade > 13
          ? `High readability grade (${grade}) suggests complex academic or technical writing.`
          : `Low readability grade (${grade}) is more consistent with casual human writing.`;
    lines.push(gradeNote);
  }

  if (aiScore >= 60) {
    lines.push(
      "Patterns such as low contraction usage, passive constructions, and formulaic transitions are consistent with AI generation.",
    );
  } else {
    lines.push(
      "Natural variation in sentence length, personal voice, and contraction use points toward authentic human authorship.",
    );
  }

  lines.push(`Overall confidence: ${aiScore}% AI.`);
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

export interface DetectionResult {
  aiScore: number;
  humanScore: number;
  verdict: string;
  highlights: string;
  explanation: string;
  signalScores: SignalScores;
}

// ── Main Detection Functions ───────────────────────────────────────────────

export function detectText(text: string): DetectionResult {
  if (text.trim().length < 20) {
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
    };
  }

  const lower = toLower(text);
  const wordCount = countWords(text);
  const sentences = splitSentences(text);

  // Compute all 11 signals
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

  // Weighted average (weights sum to 100%)
  const raw =
    phraseScore * 0.2 +
    mattrScore * 0.15 +
    burstinessScore * 0.15 +
    passiveScore * 0.12 +
    contractionScore * 0.1 +
    pronounScore * 0.08 +
    readabilityScore * 0.08 +
    ngramScore * 0.05 +
    questionScore * 0.04 +
    punctScore * 0.02 +
    hedgeScore * 0.01;

  const aiScore = sigmoid(raw);
  const humanScore = 100 - aiScore;
  const verdict =
    aiScore >= 60 ? "Likely AI-Generated" : "Likely Human-Written";

  const flaggedIndices = findSuspiciousSentenceIndices(sentences);
  const highlights = flaggedIndices.join(",");

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

  const explanation = buildExplanation(aiScore, signalList, grade);

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
  };
}

// ── Image Analysis ─────────────────────────────────────────────────────────

/** Async image analysis using canvas pixel sampling + metadata heuristics */
export async function analyzeImageFile(file: File): Promise<DetectionResult> {
  const filename = toLower(file.name);

  // Filename keyword signal
  let filenameHits = 0;
  for (const kw of AI_IMAGE_KEYWORDS) {
    if (filename.includes(kw)) filenameHits++;
  }
  const filenameScore =
    filenameHits > 0 ? Math.min(90, 35 + filenameHits * 22) : 20;

  // File extension — AI generators produce webp/png more than jpeg
  const ext = filename.split(".").pop() ?? "";
  const extScore = ext === "webp" ? 65 : ext === "png" ? 55 : 45;

  let width = 0;
  let height = 0;
  let colorEntropy = 50;
  let aspectRatioScore = 40;
  let entropyScore = 50;

  try {
    const url = URL.createObjectURL(file);
    const dims = await new Promise<{ w: number; h: number }>(
      (resolve, reject) => {
        const img = new Image();
        img.onload = () =>
          resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => reject(new Error("Cannot load image"));
        img.src = url;
      },
    );
    width = dims.w;
    height = dims.h;
    URL.revokeObjectURL(url);

    // Aspect ratio signal — common AI generator dimensions
    const ratio = width / height;
    const knownAiRatios = [1.0, 16 / 9, 9 / 16, 4 / 3, 3 / 4, 3 / 2, 2 / 3];
    const isRoundRatio = knownAiRatios.some((r) => Math.abs(ratio - r) < 0.02);
    const powOf2 = [512, 768, 1024, 1280, 1536, 2048];
    const isPowerOf2 = powOf2.includes(width) || powOf2.includes(height);
    aspectRatioScore =
      isRoundRatio && isPowerOf2
        ? 82
        : isRoundRatio
          ? 65
          : isPowerOf2
            ? 62
            : 35;

    // Pixel color entropy via canvas sampling — use 20x20 grid now
    const canvas = document.createElement("canvas");
    const size = 20;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const tmpImg = new Image();
      const tmpUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve) => {
        tmpImg.onload = () => {
          ctx.drawImage(tmpImg, 0, 0, size, size);
          resolve();
        };
        tmpImg.onerror = () => resolve();
        tmpImg.src = tmpUrl;
      });
      URL.revokeObjectURL(tmpUrl);

      const imageData = ctx.getImageData(0, 0, size, size);
      const pixels = imageData.data;
      const colorSet = new Set<string>();
      for (let i = 0; i < pixels.length; i += 4) {
        const r = Math.round(pixels[i] / 12) * 12;
        const g = Math.round(pixels[i + 1] / 12) * 12;
        const b = Math.round(pixels[i + 2] / 12) * 12;
        colorSet.add(`${r},${g},${b}`);
      }
      colorEntropy = colorSet.size; // 0–400 (20x20)
      const maxEntropy = size * size;
      // High entropy (>70% of max) = photographic = human
      // Mid entropy = computational
      // Low entropy = graphic/flat
      const entropyRatio = colorEntropy / maxEntropy;
      entropyScore =
        entropyRatio > 0.7
          ? 22
          : entropyRatio > 0.45
            ? 48
            : entropyRatio > 0.2
              ? 68
              : 55;
    }
  } catch {
    // Fallback if image loading fails
  }

  // File size heuristic
  const fileSizeMB = file.size / (1024 * 1024);
  const fileSizeScore = fileSizeMB < 0.05 ? 62 : fileSizeMB > 8 ? 28 : 45;

  // Weighted combination
  const raw =
    filenameScore * 0.3 +
    aspectRatioScore * 0.25 +
    entropyScore * 0.2 +
    extScore * 0.15 +
    fileSizeScore * 0.1;

  const aiScore = sigmoid(raw);
  const humanScore = 100 - aiScore;
  const verdict =
    aiScore >= 60 ? "Likely AI-Generated" : "Likely Human-Written";

  const dimNote =
    width > 0 && height > 0
      ? `Image dimensions ${width}×${height} (${(width / height).toFixed(2)}:1 ratio${aspectRatioScore >= 65 ? ", common for AI generators" : ""}). `
      : "";
  const entropyRatio = colorEntropy / (20 * 20);
  const entropyNote =
    entropyRatio > 0.7
      ? "Rich color distribution consistent with photography. "
      : entropyRatio < 0.2
        ? "Low color diversity may indicate a flat/graphic style. "
        : "Color distribution suggests computational generation. ";
  const filenameNote =
    filenameHits > 0
      ? `Filename contains AI-associated term${filenameHits > 1 ? "s" : ""}. `
      : "";

  const explanation = `${dimNote}${entropyNote}${filenameNote}Overall confidence: ${aiScore}% AI. Manual verification recommended for images.`;

  return {
    aiScore,
    humanScore,
    verdict,
    highlights: "",
    explanation,
    signalScores: {
      phrase: filenameScore,
      vocab: Math.round((1 - entropyRatio) * 100),
      sentence: aspectRatioScore,
      burstiness: fileSizeScore,
      ngram: entropyScore,
      pronouns: 50,
      passive: extScore,
      contractions: 50,
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

/** Async file detection — uses canvas-based image analysis for image files */
export async function detectFileAsync(
  filename: string,
  snippet: string,
  file?: File,
): Promise<DetectionResult> {
  if (file) {
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      return analyzeImageFile(file);
    }
  }
  if (snippet && snippet.trim().length > 50) {
    return detectText(snippet);
  }
  return detectFile(filename, snippet);
}

// Keep legacy TO_BE_FORMS export reference for tree-shaking
void TO_BE_FORMS;
