import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

/** One shared KPI pattern: label, period/context, value, optional comparison, click-through destination. */
export function KPICard({
  label,
  period,
  value,
  changePct,
  changeDirection = "up",
  changeIsGood = true,
  icon: Icon,
  onDark = false,
}: {
  label: string;
  period: string;
  value: string;
  changePct?: string;
  changeDirection?: "up" | "down";
  changeIsGood?: boolean;
  icon?: LucideIcon;
  onDark?: boolean;
}) {
  const ArrowIcon = changeDirection === "up" ? ArrowUpRight : ArrowDownRight;
  const changeColor = changeIsGood ? "text-[var(--ro-success)]" : "text-[var(--ro-danger)]";
  return (
    <a
      href="#"
      className="flex flex-col gap-2 rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)] p-4 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--ro-text-muted)]">{label}</span>
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--ro-primary-soft)] text-[var(--ro-primary)]">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="tabular-nums font-bold text-[var(--ro-text)] text-lg">{value}</span>
        {changePct && (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-[var(--ro-danger)] text-center">
            <ArrowIcon className="h-3 w-3" />
            {changePct}
          </span>
        )}
      </div>
      <span className="text-[11px] text-[var(--ro-text-faint)]">{period}</span>
    </a>
  );
}
