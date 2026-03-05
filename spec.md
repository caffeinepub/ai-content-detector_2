# AI Content Detector

## Current State

The app has a working heuristic detection engine in `src/frontend/src/utils/detector.ts` with 4 signals:
- AI phrase density (~55 phrases)
- Vocabulary diversity (unique word ratio)
- Average sentence length uniformity
- Passive voice density (7 markers)

The `ResultCard` shows synthetic sub-scores (vocab, structure, phrase) derived directly from `aiScore` using fixed multipliers -- not the actual per-signal values.

Image/document detection uses only filename keyword matching (10 keywords) as fallback.

## Requested Changes (Diff)

### Add
- **Extended AI phrase library**: Expand from ~55 to 500+ AI-associated phrases across multiple categories (transition phrases, academic hedges, AI filler, corporate speak, etc.)
- **Sentence burstiness score**: Measure variance in sentence length; low variance = AI-like, high variance = human-like
- **Readability / Flesch-Kincaid estimation**: Very high or very low FK scores correlate with AI
- **Perplexity proxy (n-gram repetition)**: Detect repeated bigrams/trigrams as a proxy for low perplexity
- **First-person pronoun score**: Low first-person usage = more AI-like
- **Formal hedging language score**: Detect academic hedges ("it can be argued", "one might suggest", etc.)
- **Punctuation diversity score**: AI tends to use commas and periods heavily; humans use em-dashes, exclamation marks, questions more freely
- **Real per-signal scores returned in DetectionResult**: Return all signal scores (phraseScore, vocabScore, sentenceScore, burstiScore, ngramScore, pronounScore) instead of synthetic multiplier values so ResultCard shows accurate sub-scores
- **Richer explanation text**: Multi-sentence explanation citing the top 2 strongest signals that drove the verdict
- **Image analysis enhancements**: Add file size, dimensions (from Image element), aspect ratio, color entropy heuristic (pixel sample), and EXIF-absent signal to score images more meaningfully; add a `imageAnalysis` async function that reads pixel data via canvas
- **Confidence calibration**: Apply logistic-style calibration so scores cluster less around 50 and more toward the poles when signals agree

### Modify
- `detectText` return type: Add `signalScores: { phrase: number; vocab: number; sentence: number; burstiness: number; ngram: number; pronouns: number }` to `DetectionResult`
- `detectFile` to use async `analyzeImage` when a `File` object is provided (pixel sampling)
- `ResultCard` score breakdown mini-bars to use real per-signal values from `result.signalScores` instead of synthetic multipliers
- `useAnalyzeText` / `useAnalyzeFile` in `useQueries.ts` to thread real signal scores through `patchRecord`
- `ScanRecord` displayed explanation to reflect richer multi-signal summaries
- `ImageAnalyzer` to pass the actual `File` object (not just filename) to the detection call so pixel analysis can run

### Remove
- Synthetic `vocabScore / structureScore / phraseScore` multiplier derivations from `ResultCard`

## Implementation Plan

1. **Rewrite `detector.ts`**:
   - Expand AI_PHRASES to 500+ entries across 8 categories
   - Add `burstinenessScore(sentences)` -- std deviation of sentence lengths
   - Add `ngramRepetitionScore(text)` -- bigram repetition ratio
   - Add `firstPersonScore(text)` -- count I/me/my/myself presence
   - Add `punctuationDiversityScore(text)` -- ratio of diverse punctuation
   - Add `formalHedgeScore(text)` -- formal hedging phrases list
   - Update weighted formula (8 signals, tuned weights)
   - Return `signalScores` object in `DetectionResult`
   - Improve explanation builder to cite top signals
   - Add `analyzeImageFile(file: File): Promise<DetectionResult>` using canvas pixel sampling
   - Update `detectFile` to accept optional `File` and delegate to `analyzeImageFile`

2. **Update `DetectionResult` interface** to include `signalScores`

3. **Update `useQueries.ts`**:
   - `patchRecord` to also copy `signalScores`
   - `useAnalyzeFile` mutation to accept and pass `File` object

4. **Update `ImageAnalyzer.tsx`**:
   - Pass actual `file` object through the `onAnalyze` call so pixel analysis runs

5. **Update `ResultCard.tsx`**:
   - Replace synthetic score derivations with `result.signalScores.*`
   - Add 2-3 more mini-bars (burstiness, n-gram, pronouns) for richer breakdown
   - Show signal count and confidence calibration note

6. **Update `ScanRecord` / `backend.d.ts` if needed** to carry `signalScores` through (or keep it frontend-only via a wrapper type)
