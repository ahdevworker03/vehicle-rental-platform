import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Default restrained surface for future dashboard, detail, and form sections.
 * It intentionally has one border and a light elevation instead of a nested-card treatment.
 */
export function SectionCard({ children, className, title, description, action }: SectionCardProps) {
  return (
    <section className={cn("rounded-xl border border-card-border bg-card shadow-sm", className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 sm:flex-nowrap sm:gap-4 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="ui-section-title">{title}</h2>}
            {description && <p className="ui-secondary-text mt-1">{description}</p>}
          </div>
          {action && <div className="max-w-full shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn("p-4 sm:p-5", (title || action) && "pt-4")}>{children}</div>
    </section>
  );
}

type DetailSectionProps = SectionCardProps;

/** Detail-page section with the same surface language and compact spacing. */
export function DetailSection({ children, ...props }: DetailSectionProps) {
  return <SectionCard {...props}>{children}</SectionCard>;
}

type SummaryActionPanelProps = SectionCardProps;

/** Secondary detail-column panel for summary values and workflow actions. */
export function SummaryActionPanel({ children, className, ...props }: SummaryActionPanelProps) {
  return (
    <SectionCard
      {...props}
      className={cn("h-fit xl:sticky xl:top-4", className)}
    >
      {children}
    </SectionCard>
  );
}
