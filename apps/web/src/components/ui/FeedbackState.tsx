import {
  AlertCircle,
  CheckCircle2,
  CircleAlert,
  Info,
  LucideIcon,
  TriangleAlert,
  X,
} from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Skeleton } from "./skeleton";

interface LoadingStateProps {
  rows?: number;
  className?: string;
}

/** A structural loading state for lists and section content. */
export function LoadingState({ rows = 3, className }: LoadingStateProps) {
  return (
    <div aria-busy="true" aria-label="جارٍ تحميل البيانات" className={cn("space-y-3 p-4", className)}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5 bg-muted" />
            <Skeleton className="h-3 w-3/5 bg-muted" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/** Recoverable page or section error state. */
export function ErrorState({
  title = "تعذر تحميل البيانات",
  description,
  onRetry,
  retryLabel = "إعادة المحاولة",
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger">
        <AlertCircle className="size-7" aria-hidden="true" />
      </div>
      <h2 className="ui-section-title">{title}</h2>
      <p className="ui-secondary-text mt-2 max-w-sm">{description}</p>
      {onRetry && <Button className="mt-5" onClick={onRetry}>{retryLabel}</Button>}
    </div>
  );
}

interface InlineErrorProps {
  children: ReactNode;
  className?: string;
}

/** Programmatically announced inline validation or action error. */
export function InlineError({ children, className }: InlineErrorProps) {
  return (
    <p role="alert" className={cn("text-sm font-medium text-destructive", className)}>
      {children}
    </p>
  );
}

export type InlineFeedbackVariant = "info" | "success" | "warning" | "error";

interface InlineFeedbackProps {
  children: ReactNode;
  variant?: InlineFeedbackVariant;
  icon?: LucideIcon;
  className?: string;
  onDismiss?: () => void;
}

const inlineFeedbackVariants = {
  info: {
    className: "border-status-info/25 bg-status-info-bg text-status-info",
    icon: Info,
    role: "status",
  },
  success: {
    className: "border-status-positive/25 bg-status-positive-bg text-status-positive",
    icon: CheckCircle2,
    role: "status",
  },
  warning: {
    className: "border-status-warning/25 bg-status-warning-bg text-status-warning",
    icon: TriangleAlert,
    role: "status",
  },
  error: {
    className: "border-status-danger/25 bg-status-danger-bg text-status-danger",
    icon: CircleAlert,
    role: "alert",
  },
} as const;

/** Compact contextual feedback with semantic variants and optional dismissal. */
export function InlineFeedback({
  children,
  variant = "info",
  icon,
  className,
  onDismiss,
}: InlineFeedbackProps) {
  const feedback = inlineFeedbackVariants[variant];
  const Icon = icon ?? feedback.icon;

  return (
    <div
      role={feedback.role}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
        feedback.className,
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
      {onDismiss && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-my-1 -me-1 size-7 shrink-0 text-current hover:bg-current/10"
          aria-label="إغلاق"
          onClick={onDismiss}
        >
          <X aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

/** @deprecated Use InlineFeedback with the info variant. */
export function InfoBanner({ children, icon, className }: Omit<InlineFeedbackProps, "variant" | "onDismiss">) {
  return <InlineFeedback icon={icon} className={className}>{children}</InlineFeedback>;
}
