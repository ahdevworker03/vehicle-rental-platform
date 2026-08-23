import { Search, Bell, ChevronDown } from "lucide-react";

export function TopBar({
  title,
  description,
  primaryAction,
  showSearch = true,
}: {
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  showSearch?: boolean;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[var(--ro-border)] bg-[var(--ro-surface)] px-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15px] font-bold text-[var(--ro-text)] sm:text-lg">{title}</h1>
        {description && (
          <p className="mt-0.5 hidden truncate text-xs text-[var(--ro-text-muted)] sm:block">{description}</p>
        )}
      </div>

      {showSearch && (
        <div className="relative hidden w-64 shrink-0 md:block">
          <Search className="pointer-events-none absolute inset-y-0 end-3 my-auto h-4 w-4 text-[var(--ro-text-faint)]" />
          <input
            type="search"
            placeholder="بحث سريع…"
            className="h-9 w-full rounded-lg border border-[var(--ro-border)] bg-[var(--ro-bg)] pe-9 ps-3 text-sm outline-none placeholder:text-[var(--ro-text-faint)] focus:border-[var(--ro-primary)] focus:ring-2 focus:ring-[var(--ro-primary)]/15"
          />
        </div>
      )}

      {primaryAction}

      <button className="relative hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--ro-border)] text-[var(--ro-text-muted)] hover:bg-[var(--ro-bg)] sm:flex">
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-[var(--ro-danger)]" />
      </button>

      <button className="hidden shrink-0 items-center gap-2 rounded-lg border border-[var(--ro-border)] py-1.5 pe-1.5 ps-2.5 sm:flex">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ro-primary-soft)] text-[10px] font-bold text-[var(--ro-primary)]">
          هـع
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-[var(--ro-text-faint)]" />
      </button>
    </header>
  );
}
