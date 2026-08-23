import { ChevronLeft, type LucideIcon } from "lucide-react";
import { toneClasses, type StatusTone } from "./statusConfig";

/** One scannable, actionable row for the urgent-alerts band — not a decorative banner. */
export function AlertItem({
  icon: Icon,
  tone,
  title,
  meta,
  actionLabel,
}: {
  icon: LucideIcon;
  tone: StatusTone;
  title: string;
  meta: string;
  actionLabel: string;
}) {
  const c = toneClasses[tone];
  return (
    <a
      href="#"
      className={`flex items-center gap-3 rounded-lg border px-3.5 py-3 transition-colors hover:brightness-[0.98] ${c.bg} ${c.border}`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/70 ${c.text}`}>
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm font-semibold ${c.text}`}>{title}</div>
        <div className="truncate text-xs text-[var(--ro-text-muted)]">{meta}</div>
      </div>
      <span className={`hidden shrink-0 items-center gap-1 text-xs font-semibold sm:flex ${c.text}`}>
        {actionLabel}
        <ChevronLeft className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}
