import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Bot,
  Clock,
  FileText,
  Image,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ScanRecord } from "../backend.d";
import { formatTimestamp, truncate } from "../utils/highlight";

interface HistorySidebarProps {
  history: ScanRecord[] | undefined;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (scanId: bigint) => void;
  onClearAll: () => void;
  isDeletingId?: bigint | null;
  isClearingAll?: boolean;
}

function ContentTypeIcon({ type }: { type: string }) {
  if (type === "image") return <Image className="h-3.5 w-3.5" />;
  if (type === "document") return <FileText className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
}

export function HistorySidebar({
  history,
  isLoading,
  isOpen,
  onClose,
  onDelete,
  onClearAll,
  isDeletingId,
  isClearingAll,
}: HistorySidebarProps) {
  const sortedHistory = history
    ? [...history].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed right-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-80 border-l border-border bg-background transition-transform duration-300 lg:static lg:translate-x-0 lg:h-auto",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              History
            </span>
            {sortedHistory.length > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {sortedHistory.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {sortedHistory.length > 0 && (
              <Button
                data-ocid="detector.history_clear_button"
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                disabled={isClearingAll}
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
                {isClearingAll ? "Clearing..." : "Clear all"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 lg:hidden"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100%-3rem)]">
          <div data-ocid="detector.history_list" className="p-3 space-y-1.5">
            {isLoading ? (
              // Loading skeletons
              ["s1", "s2", "s3", "s4"].map((key) => (
                <div
                  key={key}
                  className="rounded-lg border border-border p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32 rounded-full" />
                    <Skeleton className="h-4 w-8 rounded" />
                  </div>
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
              ))
            ) : sortedHistory.length === 0 ? (
              <div
                data-ocid="detector.history_empty_state"
                className="flex flex-col items-center justify-center gap-3 py-12 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    No scans yet
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Run your first analysis to see history here
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {sortedHistory.map((scan, index) => {
                  const isAI = scan.verdict === "Likely AI-Generated";
                  const isDeleting = isDeletingId === scan.id;

                  return (
                    <motion.div
                      key={String(scan.id)}
                      data-ocid={`detector.history_item.${index + 1}`}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "group relative rounded-lg border border-border bg-card p-3 transition-colors hover:border-teal/30",
                        isDeleting && "opacity-50 pointer-events-none",
                      )}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {/* Verdict badge */}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold flex-shrink-0",
                              isAI
                                ? "bg-ai-score-bg text-ai-score"
                                : "bg-human-score-bg text-human-score",
                            )}
                          >
                            {isAI ? (
                              <Bot className="h-2.5 w-2.5" />
                            ) : (
                              <ShieldCheck className="h-2.5 w-2.5" />
                            )}
                            {isAI ? "AI" : "Human"}
                          </span>

                          {/* Score */}
                          <span
                            className={cn(
                              "font-mono text-xs font-bold",
                              isAI ? "text-ai-score" : "text-human-score",
                            )}
                          >
                            {isAI
                              ? Number(scan.aiScore)
                              : Number(scan.humanScore)}
                            %
                          </span>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Content type */}
                          <span className="text-muted-foreground">
                            <ContentTypeIcon type={scan.contentType} />
                          </span>

                          {/* Delete button */}
                          <button
                            type="button"
                            data-ocid={`detector.history_delete_button.${index + 1}`}
                            onClick={() => onDelete(scan.id)}
                            disabled={isDeleting}
                            aria-label="Delete scan"
                            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Snippet */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {truncate(scan.inputSnippet, 90)}
                      </p>

                      {/* Timestamp */}
                      <p className="mt-1.5 text-xs text-muted-foreground/60">
                        {formatTimestamp(scan.timestamp)}
                      </p>

                      <Separator className="mt-0" />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
