import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-2xl bg-muted/30 p-5", className)} {...props} />;
}
