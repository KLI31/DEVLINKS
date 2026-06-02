import { FileCode, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportTabsProps {
  activeTab: "editor" | "file";
  onTabChange: (tab: "editor" | "file") => void;
}

export function ImportTabs({ activeTab, onTabChange }: ImportTabsProps) {
  return (
    <div className="flex items-center gap-4 border-b">
      <button
        type="button"
        onClick={() => onTabChange("editor")}
        className={cn(
          "flex cursor-pointer items-center gap-2 border-b-2 px-1 pb-2 text-sm font-medium transition-colors",
          activeTab === "editor"
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        <FileCode className="size-4" />
        Editor JSON
      </button>
      <button
        type="button"
        onClick={() => onTabChange("file")}
        className={cn(
          "flex cursor-pointer items-center gap-2 border-b-2 px-1 pb-2 text-sm font-medium transition-colors",
          activeTab === "file"
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        <Upload className="size-4" />
        Archivo
      </button>
    </div>
  );
}
