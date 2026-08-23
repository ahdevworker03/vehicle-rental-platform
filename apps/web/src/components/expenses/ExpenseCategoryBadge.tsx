import type { ExpenseResponse } from "@workspace/api-client-react";

import { cn } from "@/lib/utils";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels";

interface ExpenseCategoryBadgeProps {
  category: ExpenseResponse["category"];
  className?: string;
}

/** A neutral category label: expense categories are descriptors, not statuses. */
export function ExpenseCategoryBadge({ category, className }: ExpenseCategoryBadgeProps) {
  const config = EXPENSE_CATEGORY_LABELS[category];
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-muted/45 px-2 py-1 text-xs font-semibold text-foreground", className)}>
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      {config.label}
    </span>
  );
}
