import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataListShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  toolbar?: ReactNode;
  className?: string;
}

/**
 * Surface and header for future dense data tables/lists. The scroll boundary
 * stays inside the shell so desktop tables remain usable on narrow screens.
 */
export function DataListShell({ children, title, description, toolbar, className }: DataListShellProps) {
  return (
    <section className={cn("overflow-hidden rounded-xl border border-card-border bg-card shadow-sm", className)}>
      {(title || toolbar) && (
        <header className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            {title && <h2 className="ui-section-title">{title}</h2>}
            {description && <p className="ui-secondary-text mt-1">{description}</p>}
          </div>
          {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
        </header>
      )}
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
