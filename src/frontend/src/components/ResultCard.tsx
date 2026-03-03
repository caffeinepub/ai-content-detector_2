import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AlertTriangle, Bot, RotateCcw, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { ScanRecord } from "../backend.d";
import { buildHighlightedSegments } from "../utils/highlight";

interface ResultCardProps {
  result: ScanRecord;
  originalText?: string;
  onNewScan: () => void;
}

function AnimatedBar({
  value,
  colorClass,
  label,
}: {
  value: number;
  colorClass: string;
  label: string;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className={cn("font-mono font-bold text-base", colorClass)}>
          {value}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            colorClass.replace("text-", "bg-"),
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function ResultCard({
  result,
  originalText,
  onNewScan,
}: ResultCardProps) {
  const aiScore = Number(result.aiScore);
  const humanScore = Number(result.humanScore);
  const isAI = result.verdict === "Likely AI-Generated";
  const segments = originalText
    ? buildHighlightedSegments(originalText, result.highlights)
    : [];

  return (
    <AnimatePresence>
      <motion.div
        data-ocid="detector.result_card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-xl border border-border bg-card shadow-card-lift overflow-hidden"
      >
        {/* Header stripe */}
        <div
          className={cn("h-1 w-full", isAI ? "bg-ai-score" : "bg-human-score")}
        />

        <div className="p-5 space-y-5">
          {/* Verdict */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isAI ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ai-score-bg">
                  <Bot className="h-5 w-5 text-ai-score" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-human-score-bg">
                  <ShieldCheck className="h-5 w-5 text-human-score" />
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-0.5">
                  Detection Result
                </p>
                <Badge
                  className={cn(
                    "font-semibold text-sm px-3 py-1 border-0",
                    isAI
                      ? "bg-ai-score-bg text-ai-score"
                      : "bg-human-score-bg text-human-score",
                  )}
                >
                  {result.verdict}
                </Badge>
              </div>
            </div>

            <Button
              data-ocid="detector.new_scan_button"
              variant="outline"
              size="sm"
              onClick={onNewScan}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New Scan
            </Button>
          </div>

          <Separator />

          {/* Confidence bars */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Confidence Scores
            </p>
            <AnimatedBar
              value={aiScore}
              colorClass="text-ai-score"
              label="AI-Generated"
            />
            <AnimatedBar
              value={humanScore}
              colorClass="text-human-score"
              label="Human-Written"
            />
          </div>

          <Separator />

          {/* Explanation */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Analysis Summary
            </p>
            <p className="text-sm leading-relaxed text-foreground/80">
              {result.explanation}
            </p>
          </div>

          {/* Highlighted text (for text analysis) */}
          {segments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Highlighted Sections
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Suspicious sentences marked</span>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed max-h-48 overflow-y-auto">
                  {segments.map((seg, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: sentence position is stable for this rendered text
                    <span key={`seg-${i}`}>
                      {seg.highlighted ? (
                        <mark className="highlight-sentence">{seg.text}</mark>
                      ) : (
                        <span>{seg.text}</span>
                      )}
                      {i < segments.length - 1 ? " " : ""}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
