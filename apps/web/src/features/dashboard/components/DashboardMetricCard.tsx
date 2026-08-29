import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type DashboardMetricState = "ready" | "loading" | "error";
export type DashboardMetricTone =
  "default" | "info" | "positive" | "warning" | "danger";

interface DashboardMetricCardProps {
  label: string;
  value: string;
  context: string;
  icon: LucideIcon;
  tone?: DashboardMetricTone;
  state?: DashboardMetricState;
  errorMessage?: string;
  onClick?: () => void;
}

const iconToneClass: Record<DashboardMetricTone, string> = {
  default: "bg-muted text-muted-foreground",
  info: "bg-status-info-bg text-status-info",
  positive: "bg-status-positive-bg text-status-positive",
  warning: "bg-status-warning-bg text-status-warning",
  danger: "bg-status-danger-bg text-status-danger",
};

/** A compact, dashboard-only KPI surface that never renders a loading zero. */
export function DashboardMetricCard({
  label,
  value,
  context,
  icon: Icon,
  tone = "default",
  state = "ready",
  errorMessage = "تعذر تحميل القيمة",
  onClick,
}: DashboardMetricCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="ui-secondary-text font-medium">{label}</p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            iconToneClass[tone],
          )}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4">
        {state === "loading" ? (
          <Skeleton
            aria-label={`جارٍ تحميل ${label}`}
            className="h-8 w-24 bg-muted"
          />
        ) : state === "error" ? (
          <p className="text-sm font-semibold text-destructive">
            {errorMessage}
          </p>
        ) : (
          <p className="ui-kpi-value number-ltr">{value}</p>
        )}
        <p className="ui-secondary-text mt-1.5">
          {state === "error" ? "حاول مرة أخرى لاحقاً" : context}
        </p>
      </div>
    </>
  );

  const className = cn(
    "min-h-[116px] rounded-xl border border-card-border bg-card p-3.5 text-start shadow-sm transition-colors sm:p-4",
    onClick && "hover:bg-muted/40 active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
