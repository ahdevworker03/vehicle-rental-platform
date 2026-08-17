import {
  Calendar,
  CheckCircle,
  StickyNote,
  ChevronRight,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateAr } from "@/lib/format";
import { TASK_STATUS_LABELS } from "@/lib/labels";
import { isTaskOverdue } from "@/features/tasks/selectors";
import type { TaskResponse } from "@workspace/api-client-react";

const PENDING_STYLES = {
  iconBg: "bg-[hsl(var(--status-maintenance-bg))]",
  iconText: "text-[hsl(var(--status-maintenance))]",
  badge: "bg-[hsl(var(--status-maintenance-bg))] text-[hsl(var(--status-maintenance))]",
};

const OVERDUE_STYLES = {
  iconBg: "bg-[hsl(var(--status-danger-bg))]",
  iconText: "text-[hsl(var(--status-danger))]",
  badge: "bg-[hsl(var(--status-danger-bg))] text-[hsl(var(--status-danger))]",
};

const COMPLETED_STYLES = {
  iconBg: "bg-[hsl(var(--status-available-bg))]",
  iconText: "text-[hsl(var(--status-available))]",
  badge: "bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))]",
};

interface TaskCardProps {
  task: TaskResponse;
  onClick: () => void;
}

/**
 * Task list row. Displays due date, status, and notes. A pending task that is
 * overdue is presented with an overdue style derived from `due_date` — this does
 * not persist or introduce any new Task status.
 */
export function TaskCard({ task, onClick }: TaskCardProps) {
  const completed = task.status === "COMPLETED";
  const overdue = !completed && isTaskOverdue(task);

  const styles = completed ? COMPLETED_STYLES : overdue ? OVERDUE_STYLES : PENDING_STYLES;
  const StatusIcon = completed ? CheckCircle : Circle;

  return (
    <button
      onClick={onClick}
      className="w-full text-right bg-card rounded-2xl border border-card-border shadow-sm p-4 flex items-center gap-3 active:scale-[0.99] transition-transform"
    >
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
          styles.iconBg,
        )}
      >
        <StatusIcon className={cn("w-5 h-5", styles.iconText)} strokeWidth={1.8} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-bold text-foreground truncate">
            {task.notes ? task.notes : "مهمة بدون ملاحظات"}
          </span>
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0",
              styles.badge,
            )}
          >
            {TASK_STATUS_LABELS[task.status] ?? task.status}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
            {formatDateAr(task.dueDate)}
            {overdue && (
              <span className="text-xs font-bold text-[hsl(var(--status-danger))]">متأخرة</span>
            )}
          </span>
          {task.notes && (
            <StickyNote className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2} />
    </button>
  );
}
