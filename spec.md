# AI Content Detector

## Current State
The app has a single-engine text detection pipeline in `utils/detector.ts` that runs 11 heuristic signals (AI phrase density, MATTR, burstiness, passive voice, contractions, first-person pronouns, readability, n-gram repetition, question ratio, punctuation diversity, formal hedging). It produces a weighted-average raw score, applies sigmoid calibration, and returns an `aiScore`, `humanScore`, `verdict`, `highlights` (comma-separated sentence indices), `explanation`, and `signalScores`. The `ResultCard` renders 6 mini-bars from `signalScores`, two main confidence bars, a text explanation, and highlighted suspicious sentences.

## Requested Changes (Diff)

### Add
- **Multi-model voting architecture** in `detectText()`: three independent sub-models each produce a normalized 0–100 score, which are then combined via weighted averaging.
  - **Model A — RoBERTa-style classifier** (weight 40%): expanded AI-phrase density + structural patterns that mirror what a transformer classifier would flag (sentence-opening patterns, hedge phrases, formal register markers, zero personal voice, zero rhetorical questions). Normalizes hit density against word count with a sigmoid curve.
  - **Model B — GPT-2 perplexity estimator** (weight 35%): proxy for perplexity using vocabulary diversity (MATTR), n-gram repetition, and sentence-length burstiness. Low perplexity (repetitive, predictable text) = high AI score. Combines the three sub-signals into a single perplexity proxy score.
  - **Model C — Stylometric analysis** (weight 25%): lexical richness, passive voice density, contraction rate, first-person pronoun density, punctuation variety, and readability grade. Produces a stylometric AI-likelihood score.
- **Per-model score tracking**: `ModelVotes` type exposed alongside `SignalScores` so the UI can show which model flagged the content.
- **80% threshold flagging**: `findSuspiciousSentenceIndices` upgraded to run each sentence through a mini version of all three models; sentences whose combined mini-score exceeds 80 are flagged.
- **Detailed per-model explanation**: `buildExplanation` now mentions all three model names, their individual scores, and the top contributing signals per model.
- `ModelVotes` type exported from `detector.ts`.
- `DetectionResult.modelVotes` field added.
- **ResultCard** new section: "Model Votes" showing three horizontal bars (RoBERTa, GPT-2 Perplexity, Stylometric) with individual scores and a brief label explaining what each model measures.

### Modify
- `detectText()` refactored to compute Model A, B, C scores internally then combine with weights 0.40 / 0.35 / 0.25.
- `buildExplanation()` updated to cite model names and individual scores.
- `findSuspiciousSentenceIndices()` threshold raised to 80% composite score per sentence.
- `SignalScores` kept unchanged for backward compatibility; `ModelVotes` is a new parallel type.
- `ResultCard` — "Signal Breakdown" section replaced with two subsections: "Model Votes" (3 bars) + "Signal Breakdown" (6 bars as before).

### Remove
- Nothing removed. All existing signals are retained and redistributed into the three models.

## Implementation Plan
1. Add `ModelVotes` interface to `detector.ts`.
2. Refactor `detectText()`:
   a. Compute all existing sub-signals (unchanged math).
   b. Combine into Model A score (RoBERTa proxy): phrase density, sentence openers, hedge, no-question, no-contraction, no-first-person signals.
   c. Combine into Model B score (GPT-2 perplexity proxy): MATTR, burstiness, n-gram repetition.
   d. Combine into Model C score (Stylometric): passive voice, readability, punctuation diversity, contraction rate, first-person rate.
   e. Final score = 0.40×A + 0.35×B + 0.25×C, then sigmoid.
3. Upgrade `findSuspiciousSentenceIndices()` to use per-sentence mini scoring against all three models, flag if composite ≥ 80.
4. Update `buildExplanation()` to include model names, scores, and per-model rationale.
5. Add `modelVotes` to `DetectionResult`.
6. Update `ResultCard` to render a "Model Votes" section above the Signal Breakdown.
