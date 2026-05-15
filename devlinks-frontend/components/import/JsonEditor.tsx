"use client";

import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  isValid?: boolean | null;
  errorCount?: number;
}

export function JsonEditor({ value, onChange, className, isValid, errorCount }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const lineCount = value.split("\n").length;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = target.value.substring(0, start) + "  " + target.value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  }, [onChange]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    if (!textarea || !lineNumbers) return;

    const syncScroll = () => {
      lineNumbers.scrollTop = textarea.scrollTop;
    };
    textarea.addEventListener("scroll", syncScroll);
    return () => textarea.removeEventListener("scroll", syncScroll);
  }, []);

  const statusColor =
    isValid === true
      ? "border-emerald-500/50 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
      : isValid === false
        ? "border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/20"
        : "border-input focus-visible:border-ring focus-visible:ring-ring/50";

  return (
    <div className={cn("flex flex-col rounded-lg border", className)}>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">Editor JSON</span>
        {isValid !== null && (
          <span
            className={cn(
              "text-xs font-medium",
              isValid ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
            )}
          >
            {isValid
              ? "JSON válido"
              : `${errorCount ?? 1} error${errorCount !== 1 ? "es" : ""}`}
          </span>
        )}
      </div>
      <div className="flex overflow-hidden">
        <div
          ref={lineNumbersRef}
          className="shrink-0 select-none overflow-hidden bg-muted/40 py-3 pr-2 pl-3 text-right text-xs leading-6 text-muted-foreground"
          style={{ fontFamily: "ui-monospace, monospace" }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className={cn(
            "min-h-[360px] flex-1 resize-none bg-transparent px-3 py-3 text-xs leading-6 outline-none",
            statusColor,
          )}
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        />
      </div>
    </div>
  );
}
