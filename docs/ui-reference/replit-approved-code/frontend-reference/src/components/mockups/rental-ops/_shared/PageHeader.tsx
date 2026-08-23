import type { ReactNode } from "react";

/** Shared responsive page-header/action-bar: title + context first, one primary action visible, secondary content wraps. */
export function PageHeader({
  title,
  description,
  primaryAction,
  secondary,
}: {
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--ro-border)] bg-[var(--ro-surface)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <h2 className="text-base font-bold text-[var(--ro-text)] sm:text-lg">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-[var(--ro-text-muted)] sm:text-sm">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {secondary}
        {primaryAction}
      </div>
    </div>
  );
}

export function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--ro-primary)] px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--ro-primary)]/90">
      {children}
    </button>
  );
}

export function SecondaryButton({ children }: { children: ReactNode }) {
  return (
    <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--ro-border)] bg-[var(--ro-surface)] px-3.5 text-sm font-semibold text-[var(--ro-text)] hover:bg-[var(--ro-bg)]">
      {children}
    </button>
  );
}
