"use client";

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Upload, Link, ImageIcon, X, AlertCircle } from "lucide-react";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export type AvatarUploadResult =
  | { type: "file"; file: File; preview: string }
  | { type: "url"; url: string }
  | null;

interface AvatarUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSrc?: string | null;
  fallback: string;
  onConfirm: (result: AvatarUploadResult) => void;
}

export function AvatarUploadModal({
  open,
  onOpenChange,
  currentSrc,
  fallback,
  onConfirm,
}: AvatarUploadModalProps) {
  const [activeTab, setActiveTab] = useState("file");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Formato no válido. Usa JPG, PNG, GIF o WebP.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "El archivo excede 2MB.";
    }
    return null;
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        setSelectedFile(null);
        setFilePreview(null);
        return;
      }
      setFileError(null);
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleUrlChange = useCallback((value: string) => {
    setUrlValue(value);
    setUrlError(null);
    if (!value.trim()) {
      setUrlPreview(null);
      return;
    }
    // Validación básica de URL
    try {
      new URL(value);
      setUrlPreview(value);
    } catch {
      setUrlPreview(null);
    }
  }, []);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError(null);
    setUrlValue("");
    setUrlPreview(null);
    setUrlError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleConfirm = useCallback(() => {
    if (activeTab === "file") {
      if (selectedFile && filePreview) {
        onConfirm({ type: "file", file: selectedFile, preview: filePreview });
      } else {
        onConfirm(null);
      }
    } else {
      if (urlValue.trim()) {
        try {
          new URL(urlValue.trim());
          onConfirm({ type: "url", url: urlValue.trim() });
        } catch {
          setUrlError("URL no válida.");
          return;
        }
      } else {
        onConfirm(null);
      }
    }
    handleReset();
    onOpenChange(false);
  }, [activeTab, selectedFile, filePreview, urlValue, onConfirm, onOpenChange, handleReset]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleCancel = useCallback(() => {
    handleReset();
    onOpenChange(false);
  }, [handleReset, onOpenChange]);

  const previewSrc = filePreview || urlPreview || currentSrc;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Foto de perfil</DialogTitle>
          <DialogDescription>
            Sube una imagen o usa una URL externa.
          </DialogDescription>
        </DialogHeader>

        {previewSrc && (
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={previewSrc} alt="Vista previa" />
                <AvatarFallback className="bg-muted text-lg font-medium text-muted-foreground">
                  {fallback}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="file" className="flex-1">
              <Upload className="mr-1.5 size-4" />
              Archivo
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1">
              <Link className="mr-1.5 size-4" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-3 space-y-3">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/40 hover:border-muted-foreground/30 hover:bg-muted/60"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileInputChange}
                className="sr-only"
              />
              {selectedFile ? (
                <div className="flex flex-col items-center gap-1">
                  <ImageIcon className="size-6 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ) : (
                <>
                  <Upload
                    className={cn(
                      "size-8 transition-colors",
                      isDragging ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <div className="text-center">
                    <p className="text-xs font-medium text-foreground">
                      Arrastra una imagen aquí
                    </p>
                    <p className="text-xs text-muted-foreground">
                      o haz clic para seleccionar
                    </p>
                  </div>
                </>
              )}
            </div>

            {fileError && (
              <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
                <AlertCircle className="size-3.5 shrink-0" />
                {fileError}
              </div>
            )}

            {selectedFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="w-full gap-1.5 text-destructive hover:text-destructive"
              >
                <X className="size-3.5" />
                Quitar selección
              </Button>
            )}

            <p className="text-center text-xs text-muted-foreground">
              JPG, PNG, GIF o WebP. Máximo 2MB.
            </p>
          </TabsContent>

          <TabsContent value="url" className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-card-foreground">
                URL de la imagen
              </label>
              <Input
                type="url"
                placeholder="https://ejemplo.com/mi-foto.jpg"
                value={urlValue}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
            </div>

            {urlError && (
              <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
                <AlertCircle className="size-3.5 shrink-0" />
                {urlError}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              La imagen debe ser accesible públicamente.
            </p>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={
              activeTab === "file"
                ? !!fileError
                : urlValue.trim().length > 0 && !!urlError
            }
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
