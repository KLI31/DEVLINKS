"use client";

import { useState, useCallback } from "react";
import { Upload, FileJson, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  error?: string | null;
  fileName?: string | null;
}

type DropState = "idle" | "dragging" | "error" | "success";

export function DropZone({ onFileSelect, onClear, error, fileName }: DropZoneProps) {
  const [dragState, setDragState] = useState<DropState>("idle");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragState("dragging");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragState("idle");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragState("idle");

      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/json") {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const currentState: DropState = error
    ? "error"
    : fileName
      ? "success"
      : dragState;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors",
        currentState === "idle" && "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/50",
        currentState === "dragging" && "border-primary bg-primary/5",
        currentState === "error" && "border-destructive bg-destructive/5",
        currentState === "success" && "border-emerald-500/50 bg-emerald-500/5",
      )}
    >
      {fileName ? (
        <>
          <FileJson className="size-8 text-emerald-500" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{fileName}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onClear}
              aria-label="Quitar archivo"
            >
              <X className="size-3" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <Upload className="size-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Arrastra un archivo JSON aquí
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              o haz clic para seleccionar
            </p>
          </div>
        </>
      )}

      <input
        type="file"
        accept="application/json"
        onChange={handleInputChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />

      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
