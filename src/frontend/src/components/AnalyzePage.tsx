import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Image, TriangleAlert, Type, Zap } from "lucide-react";
import type { ScanRecord } from "../backend.d";
import type { EnrichedScanRecord } from "../hooks/useQueries";
import { DocumentAnalyzer } from "./DocumentAnalyzer";
import { HistorySidebar } from "./HistorySidebar";
import { ImageAnalyzer } from "./ImageAnalyzer";
import { TextAnalyzer } from "./TextAnalyzer";

interface AnalyzePageProps {
  userId: string;
  isQuotaReached: boolean;
  dailyCount: number;
  quotaLimit: number;
  plan: "free" | "pro" | "team";
  onNavigatePlans: () => void;
  analyzeText: (text: string) => Promise<EnrichedScanRecord>;
  analyzeFile: (
    contentType: string,
    filename: string,
    snippet: string,
    file?: File,
  ) => Promise<EnrichedScanRecord>;
  isTextLoading: boolean;
  isFileLoading: boolean;
  isActorLoading: boolean;
  textError: Error | null;
  fileError: Error | null;
  resetFileError: () => void;
  history: ScanRecord[] | undefined;
  isHistoryLoading: boolean;
  onDeleteScan: (scanId: bigint) => void;
  onClearHistory: () => void;
  isDeletingId?: bigint | null;
  isClearingAll?: boolean;
  isAuthenticated: boolean;
  onLogin: () => void;
  onNavigateProfile?: () => void;
}

export function AnalyzePage({
  userId: _userId,
  isQuotaReached,
  plan,
  onNavigatePlans,
  analyzeText,
  analyzeFile,
  isTextLoading,
  isFileLoading,
  isActorLoading,
  textError,
  fileError,
  resetFileError,
  history,
  isHistoryLoading,
  onDeleteScan,
  onClearHistory,
  isDeletingId,
  isClearingAll,
  isAuthenticated,
  onLogin,
  onNavigateProfile,
}: AnalyzePageProps) {
  return (
    <div className="flex">
      {/* Main content */}
      <main className="flex-1 min-w-0 px-4 py-6 md:px-6 lg:pr-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Page header */}
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Analyze Content
            </h1>
            <p className="text-sm text-muted-foreground">
              Detect whether text, images, or documents were created by AI.
              Powered by advanced pattern recognition.
            </p>
          </div>

          {/* Quota warning */}
          {isQuotaReached && (
            <div
              data-ocid="analyze.quota_error_state"
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive">
                  Daily limit reached
                </p>
                <p className="mt-0.5 text-xs text-destructive/80">
                  You've used all your free scans today. Upgrade for unlimited
                  scans.
                </p>
              </div>
              {plan === "free" && (
                <button
                  type="button"
                  data-ocid="analyze.upgrade_button"
                  onClick={onNavigatePlans}
                  className="ml-auto flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors flex-shrink-0"
                >
                  <Zap className="h-3 w-3" />
                  Upgrade
                </button>
              )}
            </div>
          )}

          {/* Main tabs */}
          <Tabs
            defaultValue="text"
            className="w-full"
            onValueChange={() => resetFileError()}
          >
            <TabsList className="grid w-full grid-cols-3 rounded-lg bg-muted p-1 h-10">
              <TabsTrigger
                data-ocid="analyze.text.tab"
                value="text"
                className="flex items-center gap-1.5 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-xs"
              >
                <Type className="h-3.5 w-3.5" />
                Text
              </TabsTrigger>
              <TabsTrigger
                data-ocid="analyze.image.tab"
                value="image"
                className="flex items-center gap-1.5 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-xs"
              >
                <Image className="h-3.5 w-3.5" />
                Image
              </TabsTrigger>
              <TabsTrigger
                data-ocid="analyze.document.tab"
                value="document"
                className="flex items-center gap-1.5 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                Document
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-4">
              <TextAnalyzer
                userId={_userId}
                isQuotaReached={isQuotaReached}
                onAnalyze={analyzeText}
                isLoading={isTextLoading}
                isActorLoading={isActorLoading}
                error={textError}
                onNavigateProfile={onNavigateProfile}
              />
            </TabsContent>

            <TabsContent value="image" className="mt-4">
              <ImageAnalyzer
                userId={_userId}
                isQuotaReached={isQuotaReached}
                onAnalyze={analyzeFile}
                isLoading={isFileLoading}
                isActorLoading={isActorLoading}
                error={fileError}
                isAuthenticated={isAuthenticated}
                onLogin={onLogin}
                onNavigateProfile={onNavigateProfile}
              />
            </TabsContent>

            <TabsContent value="document" className="mt-4">
              <DocumentAnalyzer
                userId={_userId}
                isQuotaReached={isQuotaReached}
                onAnalyze={analyzeFile}
                isLoading={isFileLoading}
                isActorLoading={isActorLoading}
                error={fileError}
                isAuthenticated={isAuthenticated}
                onLogin={onLogin}
                onNavigateProfile={onNavigateProfile}
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
          isLoading={isHistoryLoading}
          isOpen={true}
          onClose={() => {}}
          onDelete={onDeleteScan}
          onClearAll={onClearHistory}
          isDeletingId={isDeletingId}
          isClearingAll={isClearingAll}
        />
      </div>
    </div>
  );
}
