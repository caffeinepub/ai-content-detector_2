import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Bot,
  Download,
  FileText,
  Image,
  Shield,
  ShieldCheck,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ScanRecord } from "../backend.d";
import { formatTimestamp, truncate } from "../utils/highlight";

interface DashboardPageProps {
  history: ScanRecord[] | undefined;
  isLoading: boolean;
  onDelete: (scanId: bigint) => void;
  onClearAll: () => void;
  isDeletingId?: bigint | null;
  isClearingAll?: boolean;
}

type FilterTab = "all" | "ai" | "human" | "text" | "image" | "document";

function StatCard({
  label,
  value,
  colorClass,
  icon,
  index,
}: {
  label: string;
  value: number | string;
  colorClass: string;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <div
      data-ocid={`dashboard.stat_card.${index}`}
      className="rounded-xl border border-border bg-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          {label}
        </p>
        <div
          className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            colorClass,
          )}
        >
          {icon}
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function ContentIcon({ type }: { type: string }) {
  if (type === "image")
    return <Image className="h-3.5 w-3.5 text-muted-foreground" />;
  if (type === "document")
    return <FileText className="h-3.5 w-3.5 text-muted-foreground" />;
  return <Type className="h-3.5 w-3.5 text-muted-foreground" />;
}

function GdprBanner() {
  const [dismissed, setDismiss] = useState(() => {
    return localStorage.getItem("aidetector_gdpr_dismissed") === "1";
  });

  if (dismissed) return null;

  return (
    <div
      data-ocid="dashboard.gdpr_banner"
      className="flex items-start gap-3 rounded-xl border border-teal/30 bg-teal-muted/50 px-4 py-3.5 mb-4"
    >
      <Shield className="h-4 w-4 flex-shrink-0 text-teal mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">
          GDPR & Data Privacy
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Your scans are processed securely and deleted automatically after
          analysis. We do not store your content without explicit consent. You
          have the right to delete your data at any time.
        </p>
      </div>
      <button
        type="button"
        data-ocid="dashboard.gdpr_dismiss_button"
        onClick={() => {
          localStorage.setItem("aidetector_gdpr_dismissed", "1");
          setDismiss(true);
        }}
        className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-label="Dismiss GDPR notice"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function DashboardPage({
  history,
  isLoading,
  onDelete,
  onClearAll,
  isDeletingId,
  isClearingAll,
}: DashboardPageProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const records = history ?? [];
  const sortedRecords = [...records].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  // Stats
  const totalScans = records.length;
  const aiDetected = records.filter(
    (r) => r.verdict === "Likely AI-Generated",
  ).length;
  const humanWritten = records.filter(
    (r) => r.verdict !== "Likely AI-Generated",
  ).length;

  const oneWeekAgo =
    BigInt(Date.now() - 7 * 24 * 60 * 60 * 1000) * BigInt(1_000_000);
  const thisWeek = records.filter((r) => r.timestamp >= oneWeekAgo).length;

  // Filter
  const filtered = sortedRecords.filter((r) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "ai") return r.verdict === "Likely AI-Generated";
    if (activeFilter === "human") return r.verdict !== "Likely AI-Generated";
    return r.contentType === activeFilter;
  });

  // Export CSV
  const handleExportCsv = () => {
    const header = [
      "ID",
      "Type",
      "Snippet",
      "Verdict",
      "AI%",
      "Human%",
      "Date",
    ];
    const rows = filtered.map((r) => [
      String(r.id),
      r.contentType,
      `"${r.inputSnippet.replace(/"/g, '""')}"`,
      r.verdict,
      String(r.aiScore),
      String(r.humanScore),
      formatTimestamp(r.timestamp),
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-detector-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (scanId: bigint) => {
    setDeletingId(scanId);
    try {
      await onDelete(scanId);
    } finally {
      setDeletingId(null);
    }
  };

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "ai", label: "AI-Generated" },
    { id: "human", label: "Human-Written" },
    { id: "text", label: "Text" },
    { id: "image", label: "Image" },
    { id: "document", label: "Document" },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <GdprBanner />

      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your detection activity and scan history.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading ? (
          ["s1", "s2", "s3", "s4"].map((key) => (
            <div
              key={key}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              index={1}
              label="Total Scans"
              value={totalScans}
              colorClass="bg-muted text-muted-foreground"
              icon={<FileText className="h-4 w-4" />}
            />
            <StatCard
              index={2}
              label="AI Detected"
              value={aiDetected}
              colorClass="bg-ai-score-bg text-ai-score"
              icon={<Bot className="h-4 w-4" />}
            />
            <StatCard
              index={3}
              label="Human Written"
              value={humanWritten}
              colorClass="bg-human-score-bg text-human-score"
              icon={<ShieldCheck className="h-4 w-4" />}
            />
            <StatCard
              index={4}
              label="This Week"
              value={thisWeek}
              colorClass="bg-teal-muted text-teal"
              icon={<BarChart className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      <Separator />

      {/* History table */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-base font-semibold text-foreground">
            Scan History
          </h2>
          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <>
                <Button
                  data-ocid="dashboard.export_csv_button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  className="gap-1.5 text-xs h-8"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
                <Button
                  data-ocid="dashboard.clear_all_button"
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  disabled={isClearingAll}
                  className="gap-1.5 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isClearingAll ? "Clearing..." : "Clear All"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div
          data-ocid="dashboard.filter.tab"
          className="flex flex-wrap gap-1.5"
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid={`dashboard.${tab.id}.tab`}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                activeFilter === tab.id
                  ? "bg-teal text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div data-ocid="dashboard.loading_state" className="p-8 space-y-3">
              {["r1", "r2", "r3", "r4"].map((key) => (
                <div key={key} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              data-ocid="dashboard.history_empty_state"
              className="flex flex-col items-center justify-center gap-3 py-16 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No scans found
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {activeFilter === "all"
                    ? "Run your first analysis to see results here"
                    : "No scans match this filter"}
                </p>
              </div>
            </div>
          ) : (
            <Table data-ocid="dashboard.history_table">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="w-10 text-xs">Type</TableHead>
                  <TableHead className="text-xs">Snippet</TableHead>
                  <TableHead className="w-36 text-xs">Verdict</TableHead>
                  <TableHead className="w-16 text-xs">AI%</TableHead>
                  <TableHead className="w-32 text-xs hidden sm:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="w-10 text-xs" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((scan, index) => {
                  const isAI = scan.verdict === "Likely AI-Generated";
                  const isDeleting =
                    isDeletingId === scan.id || deletingId === scan.id;

                  return (
                    <TableRow
                      key={String(scan.id)}
                      data-ocid={`dashboard.history_row.${index + 1}`}
                      className={cn(
                        "border-border",
                        isDeleting && "opacity-50 pointer-events-none",
                      )}
                    >
                      <TableCell className="py-3">
                        <ContentIcon type={scan.contentType} />
                      </TableCell>
                      <TableCell className="py-3">
                        <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2 max-w-xs">
                          {truncate(scan.inputSnippet, 100)}
                        </p>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          className={cn(
                            "text-xs font-semibold border-0 px-2 py-0.5",
                            isAI
                              ? "bg-ai-score-bg text-ai-score"
                              : "bg-human-score-bg text-human-score",
                          )}
                        >
                          {isAI ? "AI" : "Human"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span
                          className={cn(
                            "font-mono text-xs font-bold",
                            isAI ? "text-ai-score" : "text-human-score",
                          )}
                        >
                          {Number(scan.aiScore)}%
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-muted-foreground hidden sm:table-cell">
                        {formatTimestamp(scan.timestamp)}
                      </TableCell>
                      <TableCell className="py-3">
                        <button
                          type="button"
                          data-ocid={`dashboard.history_delete_button.${index + 1}`}
                          onClick={() => handleDelete(scan.id)}
                          disabled={isDeleting}
                          aria-label="Delete scan"
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

// BarChart icon inline to avoid extra import complexity
function BarChart({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}
