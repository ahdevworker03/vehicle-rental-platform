import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FocusedFlowProps {
  children: ReactNode;
  maxWidth?: "default" | "wide";
}

/** Full-viewport layout for protected create flows that intentionally omit app navigation. */
export function FocusedFlow({
  children,
  maxWidth = "default",
}: FocusedFlowProps) {
  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-background">
      <div
        className={cn(
          "flex min-h-0 w-full flex-1 flex-col self-center",
          maxWidth === "wide" ? "max-w-5xl" : "max-w-3xl",
        )}
      >
        {children}
      </div>
    </div>
  );
}
