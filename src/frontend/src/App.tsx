import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { toast } from "sonner";

import { AnalyzePage } from "./components/AnalyzePage";
import { ApiPage } from "./components/ApiPage";
import { DashboardPage } from "./components/DashboardPage";
import { PlansPage } from "./components/PlansPage";
import { ThemeProvider } from "./components/ThemeProvider";
import { type Page, TopNav } from "./components/TopNav";

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

type Plan = "free" | "pro" | "team";

function getStoredPlan(): Plan {
  const stored = localStorage.getItem("aidetector_plan");
  if (stored === "free" || stored === "pro" || stored === "team") return stored;
  return "free";
}

function DetectorApp() {
  const { identity, login, clear: logout } = useInternetIdentity();
  const { isFetching: isActorLoading } = useActor();

  const userId = identity?.getPrincipal().toString() ?? "anonymous";
  const isAuthenticated =
    identity !== undefined && !identity.getPrincipal().isAnonymous();

  const [page, setPage] = useState<Page>("dashboard");
  const [plan, setPlan] = useState<Plan>(getStoredPlan);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const DAILY_QUOTA = plan === "free" ? 5 : Number.POSITIVE_INFINITY;

  // Queries
  const { data: history, isLoading: historyLoading } = useHistory(userId);
  const { data: dailyCountBigInt } = useDailyCount(userId);
  const dailyCount = Number(dailyCountBigInt ?? 0);
  const isQuotaReached = plan === "free" && dailyCount >= 5;

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
    file?: File,
  ) => {
    return analyzeFileMutation.mutateAsync({
      contentType,
      filename,
      snippet,
      file,
    });
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

  const handlePlanChange = (newPlan: Plan) => {
    setPlan(newPlan);
    localStorage.setItem("aidetector_plan", newPlan);
  };

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav
        currentPage={page}
        onNavigate={setPage}
        dailyCount={dailyCount}
        quotaLimit={plan === "free" ? 5 : Number.POSITIVE_INFINITY}
        plan={plan}
        isAuthenticated={isAuthenticated}
        identity={identity}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {page === "dashboard" && (
          <DashboardPage
            history={history}
            isLoading={historyLoading}
            onDelete={handleDeleteScan}
            onClearAll={handleClearHistory}
            isDeletingId={deletingId}
            isClearingAll={clearHistoryMutation.isPending}
          />
        )}

        {page === "analyze" && (
          <AnalyzePage
            userId={userId}
            isQuotaReached={isQuotaReached}
            dailyCount={dailyCount}
            quotaLimit={DAILY_QUOTA}
            plan={plan}
            onNavigatePlans={() => setPage("plans")}
            analyzeText={handleAnalyzeText}
            analyzeFile={handleAnalyzeFile}
            isTextLoading={analyzeTextMutation.isPending}
            isFileLoading={analyzeFileMutation.isPending}
            isActorLoading={isActorLoading}
            textError={analyzeTextMutation.error}
            fileError={analyzeFileMutation.error}
            resetFileError={() => analyzeFileMutation.reset()}
            history={history}
            isHistoryLoading={historyLoading}
            onDeleteScan={handleDeleteScan}
            onClearHistory={handleClearHistory}
            isDeletingId={deletingId}
            isClearingAll={clearHistoryMutation.isPending}
            isAuthenticated={isAuthenticated}
            onLogin={handleLogin}
          />
        )}

        {page === "plans" && (
          <PlansPage currentPlan={plan} onPlanChange={handlePlanChange} />
        )}

        {page === "api" && (
          <ApiPage plan={plan} onNavigatePlans={() => setPage("plans")} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-4 py-4 text-center text-xs text-muted-foreground">
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
