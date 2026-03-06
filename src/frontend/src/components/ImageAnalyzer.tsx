import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlertCircle, Film, Image, Loader2, LogIn, Scan } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { EnrichedScanRecord } from "../hooks/useQueries";
import { analyzeVideoFile } from "../utils/detector";
import { DropZone } from "./DropZone";
import { LoadingState } from "./LoadingState";
import { ResultCard } from "./ResultCard";

type AnalysisMode = "image" | "video";

interface ImageAnalyzerProps {
  userId: string;
  isQuotaReached: boolean;
  onAnalyze: (
    contentType: string,
    filename: string,
    snippet: string,
    file?: File,
  ) => Promise<EnrichedScanRecord>;
  isLoading: boolean;
  isActorLoading?: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  onLogin: () => void;
  onNavigateProfile?: () => void;
}

export function ImageAnalyzer({
  userId: _userId,
  isQuotaReached,
  onAnalyze,
  isLoading,
  isActorLoading: _isActorLoading = false,
  error,
  isAuthenticated,
  onLogin,
  onNavigateProfile,
}: ImageAnalyzerProps) {
  const [mode, setMode] = useState<AnalysisMode>("image");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<EnrichedScanRecord | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleModeChange = (newMode: AnalysisMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    // Clear state when switching modes
    if (file) {
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setResult(null);
  };

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setResult(null);
  };

  const handleClear = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file || isLoading || isQuotaReached) return;

    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    try {
      if (mode === "video") {
        // Run video analysis locally, then save via onAnalyze
        const localResult = await analyzeVideoFile(file);
        const res = await onAnalyze("video", file.name, file.name, file);
        // Merge local detection scores into the returned record
        setResult({
          ...res,
          aiScore: BigInt(localResult.aiScore),
          humanScore: BigInt(localResult.humanScore),
          verdict: localResult.verdict,
          explanation: localResult.explanation,
          signalScores: localResult.signalScores,
        });
      } else {
        const res = await onAnalyze("image", file.name, file.name, file);
        setResult(res);
      }
    } catch {
      // error handled by parent
    }
  };

  const handleNewScan = () => {
    setResult(null);
    handleClear();
  };

  const isVideoMode = mode === "video";

  return (
    <>
      <div className="space-y-4">
        {/* Mode toggle */}
        <fieldset
          data-ocid="detector.video_mode_toggle"
          className="flex items-center gap-1 rounded-lg bg-muted p-1 w-full border-0 m-0 p-1"
        >
          <legend className="sr-only">Analysis mode</legend>
          <button
            type="button"
            onClick={() => handleModeChange("image")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
              mode === "image"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={mode === "image"}
          >
            <Image className="h-3.5 w-3.5" />
            Image
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("video")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
              mode === "video"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={mode === "video"}
          >
            <Film className="h-3.5 w-3.5" />
            Video
          </button>
        </fieldset>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingState
              key="loading"
              label={
                isVideoMode
                  ? "Analyzing video for AI patterns..."
                  : "Analyzing image for AI patterns..."
              }
            />
          ) : result ? (
            <ResultCard
              key="result"
              result={result}
              onNewScan={handleNewScan}
            />
          ) : (
            <motion.div
              key={`input-${mode}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {isVideoMode ? (
                <DropZone
                  data-ocid="detector.video_dropzone"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                  acceptLabel="MP4, WEBM, MOV, AVI, MKV"
                  icon="video"
                  onFileSelect={handleFileSelect}
                  selectedFile={file}
                  onClear={handleClear}
                  previewUrl={previewUrl}
                  disabled={isLoading}
                />
              ) : (
                <DropZone
                  data-ocid="detector.image_dropzone"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  acceptLabel="JPG, PNG, WEBP, GIF"
                  icon="image"
                  onFileSelect={handleFileSelect}
                  selectedFile={file}
                  onClear={handleClear}
                  previewUrl={previewUrl}
                  disabled={isLoading}
                />
              )}

              {error && (
                <div
                  data-ocid="detector.backend_error_state"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{error.message}</span>
                  </div>
                  {onNavigateProfile &&
                    error.message.includes("unavailable") && (
                      <button
                        type="button"
                        data-ocid="detector.go_to_profile_button"
                        onClick={onNavigateProfile}
                        className="ml-2 text-xs font-semibold underline text-destructive/80 hover:text-destructive whitespace-nowrap"
                      >
                        Go to Profile
                      </button>
                    )}
                </div>
              )}

              <Button
                data-ocid={
                  isVideoMode
                    ? "detector.video_analyze_button"
                    : "detector.image_analyze_button"
                }
                onClick={handleAnalyze}
                disabled={!file || isLoading || isQuotaReached}
                className="w-full gap-2 font-semibold bg-teal text-primary-foreground hover:bg-teal/90"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : isVideoMode ? (
                  <>
                    <Film className="h-4 w-4" />
                    Analyze Video
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4" />
                    Analyze Image
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Login required dialog */}
      <Dialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        data-ocid="detector.login_required_modal"
      >
        <DialogContent
          data-ocid="detector.login_required_modal"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-teal" />
              Login Required
            </DialogTitle>
            <DialogDescription>
              You need to log in to analyze files. Only authenticated users can
              use the Image/Video and Document analysis features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              data-ocid="detector.login_required_cancel_button"
              variant="outline"
              onClick={() => setLoginDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="detector.login_required_login_button"
              className="gap-2 bg-teal text-primary-foreground hover:bg-teal/90"
              onClick={() => {
                setLoginDialogOpen(false);
                onLogin();
              }}
            >
              <LogIn className="h-4 w-4" />
              Log In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
