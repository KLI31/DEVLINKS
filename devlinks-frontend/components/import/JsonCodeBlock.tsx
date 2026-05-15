"use client";

import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JsonCodeBlockProps {
  data: unknown;
  className?: string;
  readOnly?: boolean;
}

function highlightJson(json: string): React.ReactNode[] {
  const lines = json.split("\n");
  return lines.map((line, lineIndex) => {
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;

    while (remaining.length > 0) {
      // Match key ("key":)
      const keyMatch = remaining.match(/^(\s*)("[^"]+")(\s*:\s*)/);
      if (keyMatch) {
        tokens.push(
          <span key={`k-${keyIndex}`} className="text-secondary">
            {keyMatch[1]}{keyMatch[2]}{keyMatch[3]}
          </span>,
        );
        remaining = remaining.slice(keyMatch[0].length);
        keyIndex++;
        continue;
      }

      // Match string value
      const stringMatch = remaining.match(/^("(?:\\.|[^"])*")/);
      if (stringMatch) {
        tokens.push(
          <span key={`s-${keyIndex}`} className="text-emerald-400">
            {stringMatch[1]}
          </span>,
        );
        remaining = remaining.slice(stringMatch[0].length);
        keyIndex++;
        continue;
      }

      // Match number
      const numberMatch = remaining.match(/^(-?\d+(?:\.\d+)?)/);
      if (numberMatch) {
        tokens.push(
          <span key={`n-${keyIndex}`} className="text-amber-400">
            {numberMatch[1]}
          </span>,
        );
        remaining = remaining.slice(numberMatch[0].length);
        keyIndex++;
        continue;
      }

      // Match boolean
      const boolMatch = remaining.match(/^(true|false)/);
      if (boolMatch) {
        tokens.push(
          <span key={`b-${keyIndex}`} className="text-purple-400">
            {boolMatch[1]}
          </span>,
        );
        remaining = remaining.slice(boolMatch[0].length);
        keyIndex++;
        continue;
      }

      // Match null
      const nullMatch = remaining.match(/^(null)/);
      if (nullMatch) {
        tokens.push(
          <span key={`nl-${keyIndex}`} className="text-gray-400">
            {nullMatch[1]}
          </span>,
        );
        remaining = remaining.slice(nullMatch[0].length);
        keyIndex++;
        continue;
      }

      // Match punctuation/brackets
      const punctMatch = remaining.match(/^([{}\[\],])/);
      if (punctMatch) {
        tokens.push(
          <span key={`p-${keyIndex}`} className="text-muted-foreground">
            {punctMatch[1]}
          </span>,
        );
        remaining = remaining.slice(punctMatch[0].length);
        keyIndex++;
        continue;
      }

      // Fallback: consume one char
      tokens.push(
        <span key={`f-${keyIndex}`} className="text-foreground">
          {remaining[0]}
        </span>,
      );
      remaining = remaining.slice(1);
      keyIndex++;
    }

    return (
      <div key={lineIndex} className="min-h-[1.2em]">
        {tokens}
      </div>
    );
  });
}

export function JsonCodeBlock({ data, className, readOnly = true }: JsonCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);
  const highlighted = useMemo(() => highlightJson(jsonString), [jsonString]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative rounded-lg border bg-muted/50", className)}>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {readOnly ? "JSON" : "Editor JSON"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={handleCopy}
          className="h-6 gap-1 text-xs"
        >
          {copied ? (
            <>
              <Check className="size-3" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copiar
            </>
          )}
        </Button>
      </div>
      <pre className="max-h-[400px] overflow-auto p-3 text-xs leading-relaxed">
        <code className="font-mono">{highlighted}</code>
      </pre>
    </div>
  );
}
