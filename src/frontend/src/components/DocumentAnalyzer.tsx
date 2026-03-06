import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2, LogIn, Scan } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import type { EnrichedScanRecord } from "../hooks/useQueries";
import { DropZone } from "./DropZone";
import { LoadingState } from "./LoadingState";
import { ResultCard } from "./ResultCard";

interface DocumentAnalyzerProps {
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

export function DocumentAnalyzer({
  userId: _userId,
  isQuotaReached,
  onAnalyze,
  isLoading,
  isActorLoading: _isActorLoading = false,
  error,
  isAuthenticated,
  onLogin,
  onNavigateProfile,
}: DocumentAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<EnrichedScanRecord | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    setResult(null);
    setReadError(null);
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setReadError(null);
  };

  const handleAnalyze = async () => {
    if (!file || isLoading || isQuotaReached) return;

    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    // Read file content as text
    const snippet = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Truncate to first 2000 chars as snippet
        resolve(content.slice(0, 2000));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    }).catch((err: Error) => {
      setReadError(err.message);
      return file.name; // fallback
    });

    try {
      const res = await onAnalyze("document", file.name, snippet);
      setResult(res);
    } catch {
      // error handled by parent
    }
  };

  const handleNewScan = () => {
    setResult(null);
    handleClear();
  };

  return (
    <>
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingState key="loading" label="Analyzing document content..." />
          ) : result ? (
            <ResultCard
              key="result"
              result={result}
              onNewScan={handleNewScan}
            />
          ) : (
            <div key="input" className="space-y-3">
              <DropZone
                data-ocid="detector.document_dropzone"
                accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain"
                acceptLabel="PDF, TXT, DOC, DOCX"
                icon="file"
                onFileSelect={handleFileSelect}
                selectedFile={file}
                onClear={handleClear}
                disabled={isLoading}
              />

              {(error || readError) && (
                <div
                  data-ocid="detector.backend_error_state"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{readError ?? error?.message}</span>
                  </div>
                  {onNavigateProfile &&
                    (error?.message.includes("unavailable") ?? false) && (
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
                data-ocid="detector.document_analyze_button"
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
                ) : (
                  <>
                    <Scan className="h-4 w-4" />
                    Analyze Document
                  </>
                )}
              </Button>
            </div>
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
              use the Image and Document analysis features.
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
