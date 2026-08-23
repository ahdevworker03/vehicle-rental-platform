import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageActionAreaProps {
  children: ReactNode;
  className?: string;
}

/** A responsive action row for page headers and section toolbars. */
export function PageActionArea({ children, className }: PageActionAreaProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-start gap-2", className)}>
      {children}
    </div>
  );
}
