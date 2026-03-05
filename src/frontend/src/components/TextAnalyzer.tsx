import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2, Scan } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import type { EnrichedScanRecord } from "../hooks/useQueries";
import { LoadingState } from "./LoadingState";
import { ResultCard } from "./ResultCard";

interface TextAnalyzerProps {
  userId: string;
  isQuotaReached: boolean;
  onAnalyze: (text: string) => Promise<EnrichedScanRecord>;
  isLoading: boolean;
  isActorLoading?: boolean;
  error: Error | null;
}

export function TextAnalyzer({
  userId: _userId,
  isQuotaReached,
  onAnalyze,
  isLoading,
  isActorLoading = false,
  error,
}: TextAnalyzerProps) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<EnrichedScanRecord | null>(null);
  const [analyzedText, setAnalyzedText] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim() || isLoading || isQuotaReached) return;
    setAnalyzedText(text.trim());
    try {
      const res = await onAnalyze(text.trim());
      setResult(res);
    } catch {
      // error handled by parent
    }
  };

  const handleNewScan = () => {
    setResult(null);
    setText("");
    setAnalyzedText("");
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingState key="loading" label="Analyzing text patterns..." />
        ) : result ? (
          <ResultCard
            key="result"
            result={result}
            originalText={analyzedText}
            onNewScan={handleNewScan}
          />
        ) : (
          <div key="input" className="space-y-3">
            <div className="relative">
              <Textarea
                data-ocid="detector.text_input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your text here to analyze if it was written by AI or a human..."
                className={cn(
                  "min-h-[200px] resize-none text-sm leading-relaxed font-body",
                  "border-border focus-visible:ring-teal/50 focus-visible:border-teal",
                )}
                disabled={isLoading}
              />
              {/* Character count overlay */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-muted-foreground/60">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{charCount} chars</span>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div
                data-ocid="detector.result_loading_state"
                className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error.message}</span>
              </div>
            )}

            <Button
              data-ocid="detector.text_analyze_button"
              onClick={handleAnalyze}
              disabled={
                !text.trim() || isLoading || isActorLoading || isQuotaReached
              }
              className="w-full gap-2 font-semibold bg-teal text-primary-foreground hover:bg-teal/90"
              size="lg"
            >
              {isActorLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4" />
                  Analyze Text
                </>
              )}
            </Button>

            {text.trim().length > 0 && text.trim().split(/\s+/).length < 10 && (
              <p className="text-xs text-muted-foreground text-center">
                For best results, provide at least 50 words of text.
              </p>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
