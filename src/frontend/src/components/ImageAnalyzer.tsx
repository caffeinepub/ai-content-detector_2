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
import type { ScanRecord } from "../backend.d";
import { DropZone } from "./DropZone";
import { LoadingState } from "./LoadingState";
import { ResultCard } from "./ResultCard";

interface ImageAnalyzerProps {
  userId: string;
  isQuotaReached: boolean;
  onAnalyze: (
    contentType: string,
    filename: string,
    snippet: string,
  ) => Promise<ScanRecord>;
  isLoading: boolean;
  isActorLoading?: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  onLogin: () => void;
}

export function ImageAnalyzer({
  userId: _userId,
  isQuotaReached,
  onAnalyze,
  isLoading,
  isActorLoading = false,
  error,
  isAuthenticated,
  onLogin,
}: ImageAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScanRecord | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

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
      const res = await onAnalyze("image", file.name, file.name);
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
            <LoadingState
              key="loading"
              label="Analyzing image for AI patterns..."
            />
          ) : result ? (
            <ResultCard
              key="result"
              result={result}
              onNewScan={handleNewScan}
            />
          ) : (
            <div key="input" className="space-y-3">
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

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error.message}</span>
                </div>
              )}

              <Button
                data-ocid="detector.image_analyze_button"
                onClick={handleAnalyze}
                disabled={
                  !file || isLoading || isActorLoading || isQuotaReached
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
                    Analyze Image
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
