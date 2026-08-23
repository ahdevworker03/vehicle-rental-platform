import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Centered content container used by AppShell pages.
 * Width only: pages keep their own horizontal padding, so mobile behavior
 * is unchanged while desktop content is centered and capped at a sensible
 * maximum width instead of stretching indefinitely.
 *
 * `min-h-full` preserves the existing full-height page layout (spinner /
 * loading centering) now that pages are wrapped in this container.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("mx-auto min-h-full w-full max-w-[1600px]", className)}>
      {children}
    </div>
  );
}
