"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JsonCodeBlockProps {
  data: unknown;
  className?: string;
  readOnly?: boolean;
}

export function JsonCodeBlock({ data, className, readOnly = true }: JsonCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

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
        <code className="font-mono text-foreground">{jsonString}</code>
      </pre>
    </div>
  );
}
