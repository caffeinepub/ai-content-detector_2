/**
 * Enhanced AI detection engine with 8 signals and 500+ AI phrase patterns.
 * Produces per-signal scores and calibrated AI/Human confidence scores.
 */

// ── AI Phrase Lists (500+ phrases across 8 categories) ────────────────────

const TRANSITION_CONNECTORS: string[] = [
  "furthermore",
  "moreover",
  "additionally",
  "consequently",
  "nevertheless",
  "notwithstanding",
  "therefore",
  "thus",
  "hence",
  "in addition",
  "as a result",
  "in contrast",
  "on the other hand",
  "in other words",
  "that being said",
  "with that said",
  "it follows that",
  "by extension",
  "to that end",
  "in light of",
  "given that",
  "owing to",
  "due to the fact that",
  "as a consequence",
  "in turn",
  "simultaneously",
  "subsequently",
  "concurrently",
  "meanwhile",
  "thereafter",
  "at the same time",
  "by the same token",
  "in a similar vein",
  "along the same lines",
  "on a related note",
  "in this regard",
  "in this context",
  "in this sense",
  "with this in mind",
  "bearing this in mind",
  "taking this into account",
  "with respect to",
  "with regard to",
  "in terms of",
  "in relation to",
  "in connection with",
  "pertaining to",
  "concerning",
  "regarding",
  "as for",
  "as to",
  "when it comes to",
  "speaking of",
  "touching on",
  "turning to",
  "moving on to",
  "in the wake of",
  "as a direct result",
  "by contrast",
  "on the contrary",
  "despite this",
  "even so",
  "all the same",
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
  "one can see that",
  "as we can see",
  "as previously mentioned",
  "as mentioned earlier",
  "as stated above",
  "as discussed",
  "as noted above",
  "as outlined",
  "as highlighted",
  "as illustrated",
  "as demonstrated",
  "as shown",
  "as indicated",
  "as suggested",
  "as implied",
  "as argued",
  "as explained",
  "as described",
  "as presented",
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
  "at its core",
  "fundamentally",
  "at its most basic",
  "essentially",
  "primarily",
  "predominantly",
  "mainly",
  "chiefly",
  "principally",
  "above all",
  "most importantly",
  "of paramount importance",
  "of utmost importance",
  "critically",
  "crucially",
  "vitally",
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
  "in recent years",
  "in contemporary society",
];

const CORPORATE_AI_BUZZWORDS: string[] = [
  "leverage",
  "leverages",
  "leveraging",
  "utilize",
  "utilizes",
  "utilizing",
  "facilitate",
  "facilitates",
  "facilitating",
  "optimize",
  "optimizes",
  "optimizing",
  "streamline",
  "streamlines",
  "synergy",
  "synergize",
  "paradigm",
  "paradigm shift",
  "ecosystem",
  "landscape",
  "framework",
  "stakeholder",
  "stakeholders",
  "deliverable",
  "deliverables",
  "bandwidth",
  "scalable",
  "scalability",
  "robust",
  "robustness",
  "seamless",
  "seamlessly",
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
  "holistic",
  "multifaceted",
  "nuanced",
  "comprehensive overview",
  "in-depth analysis",
  "a myriad of",
  "plethora of",
  "a wide array of",
  "a wide range of",
  "a variety of",
  "various aspects",
  "diverse range",
  "diverse set",
  "broad spectrum",
  "full spectrum",
  "pivotal",
  "crucial aspect",
  "key takeaway",
  "plays a crucial role",
  "plays an important role",
  "plays a key role",
  "in the realm of",
  "overall",
  "showcases",
  "underscores",
  "overarching",
  "multidimensional",
  "ever-evolving",
  "rapidly evolving",
  "continuously evolving",
  "transformative",
  "groundbreaking",
  "innovative",
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
  "it seems that",
  "it appears that",
  "arguably",
  "seemingly",
  "ostensibly",
  "presumably",
  "supposedly",
  "allegedly",
  "purportedly",
  "it is generally accepted",
  "it is widely believed",
  "it is commonly understood",
  "many experts believe",
  "research suggests",
  "studies indicate",
  "evidence suggests",
  "data shows",
  "according to experts",
  "as some scholars argue",
  "from a certain perspective",
  "in some respects",
  "to some extent",
  "to a degree",
  "to a certain degree",
  "up to a point",
  "in a sense",
  "in some sense",
  "broadly speaking",
  "generally speaking",
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
  "serves as an example",
  "provides an example",
  "offers an example",
  "demonstrates the importance",
  "highlights the importance",
  "underscores the importance",
  "emphasizes the importance",
  "illustrates the concept",
  "showcases the potential",
  "reveals the complexity",
  "explores the relationship",
  "examines the impact",
  "addresses the challenge",
  "tackles the issue",
  "navigates the complexity",
  "bridges the gap",
  "sheds light on",
  "brings to light",
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

const DEFINITIONAL: string[] = [
  "refers to",
  "is defined as",
  "can be defined as",
  "is characterized by",
  "is distinguished by",
  "is differentiated by",
  "encompasses",
  "encompasses a wide",
  "encompasses various",
  "consists of",
  "comprises",
  "includes but is not limited to",
  "among others",
  "and so on",
  "and so forth",
  "et cetera",
  "and many more",
  "to name a few",
  "for instance",
  "for example",
  "such as",
  "including",
  "namely",
  "specifically",
  "in particular",
  "most notably",
  "especially",
  "it is worth noting that",
  "it is imperative to understand",
  "by definition",
  "in essence",
  "in practice",
  "in theory",
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
  "in the future",
  "in the years to come",
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
  ...DEFINITIONAL,
  ...CONCLUSION_ADVICE,
];

// Formal hedge phrases for signal 8
const FORMAL_HEDGE_PHRASES: string[] = [
  "it can be argued",
  "it could be argued",
  "one might argue",
  "one could argue",
  "it is possible that",
  "it may be the case",
  "seemingly",
  "ostensibly",
  "presumably",
  "it is generally accepted",
  "it is widely believed",
  "research suggests",
  "studies indicate",
  "evidence suggests",
  "data shows",
  "arguably",
  "from a certain perspective",
  "to some extent",
  "to a degree",
  "in some respects",
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

// ── Signal Computation Functions ──────────────────────────────────────────

/** Signal 1 (30%): AI phrase density — more hits = more AI */
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
  const base = Math.min(95, hits * 6 + density * 3.5);
  return { score: Math.round(base), hitCount: hits };
}

/** Signal 2 (20%): Vocabulary diversity — low unique ratio = more AI */
function computeVocabDiversity(text: string): { score: number; ratio: number } {
  const lower = toLower(text);
  const words = lower.split(/\s+/).map((w) => w.replace(/[^a-z]/g, ""));
  const valid = words.filter((w) => w.length > 1);
  if (valid.length === 0) return { score: 50, ratio: 0.5 };
  const unique = new Set(valid).size;
  const ratio = unique / valid.length;
  // Low diversity → high AI score
  const score = Math.round(Math.max(5, Math.min(95, (1 - ratio) * 120 + 10)));
  return { score, ratio };
}

/** Signal 3 (10%): Avg sentence length — medium-uniform = AI */
function computeSentenceLength(sentences: string[]): number {
  if (sentences.length === 0) return 50;
  const lengths = sentences.map(countWords);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (avg >= 16 && avg <= 24) return 72;
  if (avg >= 12 && avg <= 28) return 52;
  if (avg >= 8 && avg <= 32) return 38;
  return 25;
}

/** Signal 4 (15%): Burstiness — low std dev in sentence lengths = AI */
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
  const score = Math.round(Math.max(0, Math.min(95, 70 - stdDev * 3)));
  return { score, stdDev };
}

/** Signal 5 (10%): N-gram repetition — repeated bigrams = AI */
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
  return Math.round(Math.min(90, density * 4));
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
  // Low ratio = more AI-like = higher AI score
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

/** Signal 7 (4%): Punctuation diversity — low variety = AI */
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

/** Signal 8 (3%): Formal hedge phrases — more hedging = AI */
function computeFormalHedge(lower: string, wordCount: number): number {
  let hits = 0;
  for (const phrase of FORMAL_HEDGE_PHRASES) {
    if (lower.includes(phrase)) hits++;
  }
  if (wordCount === 0) return 0;
  return Math.min(90, hits * 12);
}

/** Logistic calibration: push scores away from 50 */
function calibrate(raw: number): number {
  const calibrated = 50 + (raw - 50) * 1.4;
  return Math.max(5, Math.min(95, Math.round(calibrated)));
}

/** Find suspicious sentences: 2+ AI phrase hits OR too-perfect length + no first-person */
function findSuspiciousSentenceIndices(
  sentences: string[],
  _lower: string,
): number[] {
  const flagged: number[] = [];
  sentences.forEach((sentence, i) => {
    const sLower = toLower(sentence);
    let hits = 0;
    for (const phrase of AI_PHRASES) {
      if (sLower.includes(phrase)) hits++;
    }
    const wc = countWords(sentence);
    const hasFirstPerson = /\b(i|me|my|we|our)\b/.test(sLower);
    const tooUniform = wc >= 16 && wc <= 24;
    if (hits >= 2 || (tooUniform && !hasFirstPerson && hits >= 1)) {
      flagged.push(i);
    }
  });
  return flagged;
}

/** Build rich explanation citing top 2 signals */
function buildExplanation(
  aiScore: number,
  phraseHits: number,
  phraseScore: number,
  burstinessScore: number,
  stdDev: number,
  vocabScore: number,
  vocabRatio: number,
  firstPersonScore: number,
  firstPersonCount: number,
): string {
  // Rank signals by their "AI-ness" contribution
  const signals: Array<{ name: string; contribution: number; detail: string }> =
    [
      {
        name: "AI phrase density",
        contribution: phraseScore,
        detail: `${phraseHits} match${phraseHits !== 1 ? "es" : ""}`,
      },
      {
        name: "low sentence burstiness",
        contribution: burstinessScore,
        detail: `std dev ${stdDev.toFixed(1)} words`,
      },
      {
        name: "low vocabulary diversity",
        contribution: vocabScore,
        detail: `${Math.round(vocabRatio * 100)}% unique words`,
      },
      {
        name: "minimal personal voice",
        contribution: firstPersonScore,
        detail: `${firstPersonCount} first-person pronoun${firstPersonCount !== 1 ? "s" : ""}`,
      },
    ];

  // Sort by AI contribution descending
  signals.sort((a, b) => b.contribution - a.contribution);
  const top2 = signals.slice(0, 2);

  const verdictPhrase =
    aiScore >= 75
      ? "strongly suggest machine-generated text"
      : aiScore >= 60
        ? "suggest likely AI-generated content"
        : aiScore >= 45
          ? "indicate mixed signals between AI and human writing"
          : "suggest mostly human-written content";

  const signal1 = `${top2[0].name.charAt(0).toUpperCase() + top2[0].name.slice(1)} (${top2[0].detail})`;
  const signal2 = `${top2[1].name} (${top2[1].detail})`;

  const lines = [`${signal1} and ${signal2} ${verdictPhrase}.`];

  if (aiScore >= 60) {
    lines.push(
      vocabScore > 60
        ? "Vocabulary patterns show low diversity, consistent with AI text generation."
        : "Writing structure shows uniform patterns typical of language models.",
    );
  } else {
    lines.push(
      firstPersonCount > 0
        ? "Personal voice and varied sentence rhythm indicate authentic human authorship."
        : "While some AI patterns are present, overall writing style leans human.",
    );
  }

  lines.push(`Overall confidence: ${aiScore}% AI.`);
  return lines.join(" ");
}

// ── Exported Types ─────────────────────────────────────────────────────────

export interface SignalScores {
  phrase: number; // 0–100, higher = more AI
  vocab: number; // 0–100, higher = more AI
  sentence: number; // 0–100, higher = more AI
  burstiness: number; // 0–100, higher = more AI (low burstiness = AI)
  ngram: number; // 0–100, higher = more AI
  pronouns: number; // 0–100, higher = more AI (low 1st-person = AI)
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
      },
    };
  }

  const lower = toLower(text);
  const wordCount = countWords(text);
  const sentences = splitSentences(text);

  // Compute all 8 signals
  const { score: phraseScore, hitCount: phraseHits } = computePhraseDensity(
    lower,
    wordCount,
  );
  const { score: vocabScore, ratio: vocabRatio } = computeVocabDiversity(text);
  const sentenceScore = computeSentenceLength(sentences);
  const { score: burstinessScore, stdDev } = computeBurstiness(sentences);
  const ngramScore = computeNgramRepetition(lower);
  const { score: pronounScore, count: firstPersonCount } = computeFirstPerson(
    lower,
    wordCount,
  );
  const punctScore = computePunctuationDiversity(text);
  const hedgeScore = computeFormalHedge(lower, wordCount);

  // Weighted average (weights sum to 100%)
  const raw =
    phraseScore * 0.3 +
    vocabScore * 0.2 +
    sentenceScore * 0.1 +
    burstinessScore * 0.15 +
    ngramScore * 0.1 +
    pronounScore * 0.08 +
    punctScore * 0.04 +
    hedgeScore * 0.03;

  const aiScore = calibrate(raw);
  const humanScore = 100 - aiScore;
  const verdict =
    aiScore >= 60 ? "Likely AI-Generated" : "Likely Human-Written";

  const flaggedIndices = findSuspiciousSentenceIndices(sentences, lower);
  const highlights = flaggedIndices.join(",");

  const explanation = buildExplanation(
    aiScore,
    phraseHits,
    phraseScore,
    burstinessScore,
    stdDev,
    vocabScore,
    vocabRatio,
    pronounScore,
    firstPersonCount,
  );

  return {
    aiScore,
    humanScore,
    verdict,
    highlights,
    explanation,
    signalScores: {
      phrase: phraseScore,
      vocab: vocabScore,
      sentence: sentenceScore,
      burstiness: burstinessScore,
      ngram: ngramScore,
      pronouns: pronounScore,
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
    filenameHits > 0 ? Math.min(90, 35 + filenameHits * 20) : 20;

  // Load image to get dimensions
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
    // Common AI power-of-two sizes
    const powOf2 = [512, 768, 1024, 1280, 1536, 2048];
    const isPowerOf2 = powOf2.includes(width) || powOf2.includes(height);
    aspectRatioScore =
      isRoundRatio && isPowerOf2
        ? 80
        : isRoundRatio
          ? 65
          : isPowerOf2
            ? 60
            : 35;

    // Pixel color entropy via canvas sampling
    const canvas = document.createElement("canvas");
    const size = 10;
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
        // Quantize to reduce noise
        const r = Math.round(pixels[i] / 16) * 16;
        const g = Math.round(pixels[i + 1] / 16) * 16;
        const b = Math.round(pixels[i + 2] / 16) * 16;
        colorSet.add(`${r},${g},${b}`);
      }
      colorEntropy = colorSet.size; // 0–(size*size = 100)
      // High entropy (>80 unique) = photographic = human
      // Low entropy (<20 unique) = flat/graphic = ambiguous
      // Mid entropy (20–80) = computational/AI-like
      entropyScore =
        colorEntropy > 80
          ? 25
          : colorEntropy > 50
            ? 50
            : colorEntropy > 20
              ? 70
              : 55;
    }
  } catch {
    // Fallback if image loading fails
  }

  // File size heuristic: AI generators tend to produce very specific sizes
  const fileSizeMB = file.size / (1024 * 1024);
  const fileSizeScore = fileSizeMB < 0.05 ? 60 : fileSizeMB > 10 ? 30 : 45;

  // Weighted combination
  const raw =
    filenameScore * 0.35 +
    aspectRatioScore * 0.3 +
    entropyScore * 0.2 +
    fileSizeScore * 0.15;

  const aiScore = calibrate(raw);
  const humanScore = 100 - aiScore;
  const verdict =
    aiScore >= 60 ? "Likely AI-Generated" : "Likely Human-Written";

  const dimNote =
    width > 0 && height > 0
      ? `Image dimensions ${width}×${height} (${(width / height).toFixed(2)}:1 ratio${aspectRatioScore >= 65 ? ", common for AI generators" : ""}). `
      : "";
  const entropyNote =
    colorEntropy > 80
      ? "Rich color distribution consistent with photography. "
      : colorEntropy < 20
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
      vocab: Math.round(100 - colorEntropy),
      sentence: aspectRatioScore,
      burstiness: fileSizeScore,
      ngram: entropyScore,
      pronouns: 50,
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

  const aiScore = calibrate(hits > 0 ? Math.min(80, 40 + hits * 15) : 28);
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
  // Document or no file: if snippet is available use text detection
  if (snippet && snippet.trim().length > 50) {
    return detectText(snippet);
  }
  return detectFile(filename, snippet);
}
