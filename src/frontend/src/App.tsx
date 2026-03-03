import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Image, TriangleAlert, Type, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DocumentAnalyzer } from "./components/DocumentAnalyzer";
import { HistorySidebar } from "./components/HistorySidebar";
import { ImageAnalyzer } from "./components/ImageAnalyzer";
import { TextAnalyzer } from "./components/TextAnalyzer";
import { ThemeProvider } from "./components/ThemeProvider";
import { TopNav } from "./components/TopNav";

import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useAnalyzeFile,
  useAnalyzeText,
  useClearHistory,
  useDailyCount,
  useDeleteScan,
  useHistory,
} from "./hooks/useQueries";

const DAILY_QUOTA = 5;

function DetectorApp() {
  const { identity, login } = useInternetIdentity();
  const { isFetching: isActorLoading } = useActor();
  const userId = identity?.getPrincipal().toString() ?? "anonymous";
  const isAuthenticated =
    identity !== undefined && !identity.getPrincipal().isAnonymous();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  // Queries
  const { data: history, isLoading: historyLoading } = useHistory(userId);
  const { data: dailyCountBigInt } = useDailyCount(userId);
  const dailyCount = Number(dailyCountBigInt ?? 0);
  const isQuotaReached = dailyCount >= DAILY_QUOTA;

  // Mutations
  const analyzeTextMutation = useAnalyzeText(userId);
  const analyzeFileMutation = useAnalyzeFile(userId);
  const clearHistoryMutation = useClearHistory(userId);
  const deleteScanMutation = useDeleteScan(userId);

  const handleAnalyzeText = async (text: string) => {
    return analyzeTextMutation.mutateAsync({ text });
  };

  const handleAnalyzeFile = async (
    contentType: string,
    filename: string,
    snippet: string,
  ) => {
    return analyzeFileMutation.mutateAsync({ contentType, filename, snippet });
  };

  const handleDeleteScan = async (scanId: bigint) => {
    setDeletingId(scanId);
    try {
      await deleteScanMutation.mutateAsync({ scanId });
      toast.success("Scan deleted");
    } catch {
      toast.error("Failed to delete scan");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistoryMutation.mutateAsync();
      toast.success("History cleared");
    } catch {
      toast.error("Failed to clear history");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        dailyCount={dailyCount}
        quotaLimit={DAILY_QUOTA}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex">
        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 py-6 md:px-6 lg:pr-4">
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Hero section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  AI Content Detector
                </h1>
                <span className="rounded-full bg-teal-muted px-2.5 py-0.5 text-xs font-semibold text-teal">
                  Beta
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Detect whether text, images, or documents were created by AI or
                a human. Powered by advanced pattern recognition.
              </p>
            </div>

            {/* Quota warning */}
            {isQuotaReached && (
              <div
                data-ocid="detector.quota_error_state"
                className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    Daily limit reached
                  </p>
                  <p className="mt-0.5 text-xs text-destructive/80">
                    You've used all {DAILY_QUOTA} free scans today. Upgrade to
                    Pro for unlimited scans.
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-auto flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors flex-shrink-0"
                >
                  <Zap className="h-3 w-3" />
                  Upgrade
                </button>
              </div>
            )}

            {/* Main tabs */}
            <Tabs
              defaultValue="text"
              className="w-full"
              onValueChange={() => analyzeFileMutation.reset()}
            >
              <TabsList className="grid w-full grid-cols-3 rounded-lg bg-muted p-1 h-10">
                <TabsTrigger
                  data-ocid="detector.text_tab"
                  value="text"
                  className="flex items-center gap-1.5 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <Type className="h-3.5 w-3.5" />
                  Text
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="detector.image_tab"
                  value="image"
                  className="flex items-center gap-1.5 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <Image className="h-3.5 w-3.5" />
                  Image
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="detector.document_tab"
                  value="document"
                  className="flex items-center gap-1.5 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Document
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4">
                <TextAnalyzer
                  userId={userId}
                  isQuotaReached={isQuotaReached}
                  onAnalyze={handleAnalyzeText}
                  isLoading={analyzeTextMutation.isPending}
                  isActorLoading={isActorLoading}
                  error={analyzeTextMutation.error}
                />
              </TabsContent>

              <TabsContent value="image" className="mt-4">
                <ImageAnalyzer
                  userId={userId}
                  isQuotaReached={isQuotaReached}
                  onAnalyze={handleAnalyzeFile}
                  isLoading={analyzeFileMutation.isPending}
                  isActorLoading={isActorLoading}
                  error={analyzeFileMutation.error}
                  isAuthenticated={isAuthenticated}
                  onLogin={login}
                />
              </TabsContent>

              <TabsContent value="document" className="mt-4">
                <DocumentAnalyzer
                  userId={userId}
                  isQuotaReached={isQuotaReached}
                  onAnalyze={handleAnalyzeFile}
                  isLoading={analyzeFileMutation.isPending}
                  isActorLoading={isActorLoading}
                  error={analyzeFileMutation.error}
                  isAuthenticated={isAuthenticated}
                  onLogin={login}
                />
              </TabsContent>
            </Tabs>

            {/* Feature callouts */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: "🔍",
                  title: "NLP Detection",
                  desc: "Sentence-level analysis",
                },
                {
                  icon: "📊",
                  title: "Confidence Score",
                  desc: "AI vs Human percentage",
                },
                {
                  icon: "⚡",
                  title: "Real-time",
                  desc: "Instant results",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-lg border border-border bg-card p-3 text-center"
                >
                  <div className="mb-1 text-lg">{f.icon}</div>
                  <p className="text-xs font-semibold text-foreground">
                    {f.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* History sidebar - desktop */}
        <div className="hidden w-80 flex-shrink-0 border-l border-border lg:block">
          <HistorySidebar
            history={history}
            isLoading={historyLoading}
            isOpen={true}
            onClose={() => {}}
            onDelete={handleDeleteScan}
            onClearAll={handleClearHistory}
            isDeletingId={deletingId}
            isClearingAll={clearHistoryMutation.isPending}
          />
        </div>
      </div>

      {/* Mobile history sidebar */}
      <div className="lg:hidden">
        <HistorySidebar
          history={history}
          isLoading={historyLoading}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onDelete={handleDeleteScan}
          onClearAll={handleClearHistory}
          isDeletingId={deletingId}
          isClearingAll={clearHistoryMutation.isPending}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-4 py-4 text-center text-xs text-muted-foreground lg:pr-[22rem]">
        © {new Date().getFullYear()}. Built with{" "}
        <span className="text-ai-score">♥</span> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal hover:underline"
        >
          caffeine.ai
        </a>
      </footer>

      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DetectorApp />
    </ThemeProvider>
  );
}
