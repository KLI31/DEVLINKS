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

function highlightJsonToHtml(json: string): string {
  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  return json
    .split("\n")
    .map((line) => {
      let result = "";
      let remaining = line;

      while (remaining.length > 0) {
        const keyMatch = remaining.match(/^(\s*)("[^"]+")(\s*:\s*)/);
        if (keyMatch) {
          result += `${escapeHtml(keyMatch[1])}<span class="json-key">${escapeHtml(keyMatch[2])}</span>${escapeHtml(keyMatch[3])}`;
          remaining = remaining.slice(keyMatch[0].length);
          continue;
        }

        const stringMatch = remaining.match(/^("(?:\\.|[^"])*")/);
        if (stringMatch) {
          result += `<span class="json-string">${escapeHtml(stringMatch[1])}</span>`;
          remaining = remaining.slice(stringMatch[0].length);
          continue;
        }

        const numberMatch = remaining.match(/^(-?\d+(?:\.\d+)?)/);
        if (numberMatch) {
          result += `<span class="json-number">${escapeHtml(numberMatch[1])}</span>`;
          remaining = remaining.slice(numberMatch[0].length);
          continue;
        }

        const boolMatch = remaining.match(/^(true|false)/);
        if (boolMatch) {
          result += `<span class="json-boolean">${escapeHtml(boolMatch[1])}</span>`;
          remaining = remaining.slice(boolMatch[0].length);
          continue;
        }

        const nullMatch = remaining.match(/^(null)/);
        if (nullMatch) {
          result += `<span class="json-null">${escapeHtml(nullMatch[1])}</span>`;
          remaining = remaining.slice(nullMatch[0].length);
          continue;
        }

        const punctMatch = remaining.match(/^([{}\[\],])/);
        if (punctMatch) {
          result += `<span class="json-punct">${escapeHtml(punctMatch[1])}</span>`;
          remaining = remaining.slice(punctMatch[0].length);
          continue;
        }

        result += escapeHtml(remaining[0]);
        remaining = remaining.slice(1);
      }

      return result || " ";
    })
    .join("\n");
}

export function JsonEditor({
  value,
  onChange,
  className,
  isValid,
  errorCount,
}: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const lineCount = value.split("\n").length;

  const highlightedHtml = highlightJsonToHtml(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newValue =
          target.value.substring(0, start) +
          "  " +
          target.value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = start + 2;
        });
      }
    },
    [onChange],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    const lineNumbers = lineNumbersRef.current;
    if (!textarea || !highlight || !lineNumbers) return;

    const syncScroll = () => {
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
      lineNumbers.scrollTop = textarea.scrollTop;
    };
    textarea.addEventListener("scroll", syncScroll);
    return () => textarea.removeEventListener("scroll", syncScroll);
  }, []);

  const statusColor =
    isValid === true
      ? "border-emerald-500/50"
      : isValid === false
        ? "border-destructive/60"
        : "border-input";

  return (
    <div className={cn("flex flex-col rounded-lg border", statusColor, className)}>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          Editor JSON
        </span>
        {isValid !== null && (
          <span
            className={cn(
              "text-xs font-medium",
              isValid
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive",
            )}
          >
            {isValid
              ? "JSON válido"
              : `${errorCount ?? 1} error${errorCount !== 1 ? "es" : ""}`}
          </span>
        )}
      </div>

      <div className="flex overflow-hidden">
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="shrink-0 select-none overflow-hidden bg-muted/40 py-3 pr-2 pl-3 text-right text-xs leading-6 text-muted-foreground"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Editor area */}
        <div className="relative flex-1">
          {/* Shared styles for perfect alignment */}
          <style>{`
            .json-editor-layer {
              font-family: 'JetBrains Mono', ui-monospace, monospace;
              font-size: 12px;
              line-height: 24px;
              padding: 12px;
              white-space: pre-wrap;
              overflow-wrap: break-word;
              tab-size: 2;
              box-sizing: border-box;
              width: 100%;
              min-height: 360px;
              margin: 0;
              border: none;
            }
            .json-key { color: hsl(var(--secondary)); font-weight: 600; }
            .json-string { color: #34d399; }
            .json-number { color: #fbbf24; }
            .json-boolean { color: #a78bfa; }
            .json-null { color: #9ca3af; }
            .json-punct { color: hsl(var(--muted-foreground)); }
          `}</style>

          {/* Highlight layer (behind) */}
          <pre
            ref={highlightRef}
            aria-hidden="true"
            className="json-editor-layer absolute left-0 top-0 overflow-auto pointer-events-none select-none bg-transparent"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />

          {/* Textarea (on top, transparent text + visible caret) */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className="json-editor-layer relative overflow-auto resize-none bg-transparent outline-none"
            style={{
              color: "transparent",
              caretColor: "hsl(var(--foreground))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
