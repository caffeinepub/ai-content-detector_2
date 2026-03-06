import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Film, Image, Upload, X } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";

interface DropZoneProps {
  accept: string;
  acceptLabel: string;
  icon?: "file" | "image" | "video";
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  previewUrl?: string | null;
  disabled?: boolean;
  "data-ocid"?: string;
}

export function DropZone({
  accept,
  acceptLabel,
  icon = "file",
  onFileSelect,
  selectedFile,
  onClear,
  previewUrl,
  disabled,
  "data-ocid": dataOcid,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = "";
  };

  const handleTriggerClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const IconComponent =
    icon === "image" ? Image : icon === "video" ? Film : FileText;

  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-all duration-200 group",
        isDragging
          ? "border-teal bg-teal-muted scale-[1.01]"
          : selectedFile
            ? "border-border bg-muted/30"
            : "border-border",
        disabled && "opacity-50",
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="sr-only"
        disabled={disabled}
        aria-label={`Upload ${acceptLabel}`}
      />

      {selectedFile ? (
        <div className="p-5">
          {/* Image preview */}
          {previewUrl && icon === "image" ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="mx-auto max-h-48 rounded-lg object-contain"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="absolute right-0 top-0 h-7 w-7 rounded-full bg-background/80 hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove file"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : previewUrl && icon === "video" ? (
            <div className="relative">
              <video
                src={previewUrl}
                className="mx-auto max-h-48 w-full rounded-lg object-contain"
                controls
                muted
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="absolute right-0 top-0 h-7 w-7 rounded-full bg-background/80 hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove file"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                <IconComponent className="h-5 w-5 text-teal" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="h-7 w-7 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove file"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 py-12 px-6 text-center cursor-pointer",
            disabled && "cursor-not-allowed",
          )}
          onClick={handleTriggerClick}
          disabled={disabled}
          aria-label={`Upload ${acceptLabel} file`}
        >
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-colors",
              isDragging
                ? "border-teal bg-teal text-primary-foreground"
                : "border-border bg-muted text-muted-foreground group-hover:border-teal/50 group-hover:text-teal",
            )}
          >
            {isDragging ? (
              <Upload className="h-5 w-5" />
            ) : (
              <IconComponent className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop to upload" : "Drag & drop your file here"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              or <span className="text-teal font-medium">browse files</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground/70 bg-muted rounded-full px-3 py-1">
            {acceptLabel}
          </p>
        </button>
      )}
    </div>
  );
}
