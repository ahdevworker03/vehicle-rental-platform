import { CalendarDays, CheckCircle2, ChevronLeft, Circle, ClipboardList } from "lucide-react";
import type { TaskResponse } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isTaskOverdue } from "@/features/tasks/selectors";
import { formatDate } from "@/lib/format";

interface TasksDataListProps {
  tasks: TaskResponse[];
  onOpen: (taskId: string) => void;
}

function TaskTitle({ task, compact = false }: { task: TaskResponse; compact?: boolean }) {
  if (compact) {
    return <span className="min-w-0"><span className="block break-words text-sm font-semibold leading-5 text-foreground">{task.notes || "مهمة بدون ملاحظات"}</span><span dir="ltr" className="number-ltr mt-1 block text-xs text-muted-foreground">#{task.id.slice(0, 8)}</span></span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${task.status === "COMPLETED" ? "bg-status-positive-bg text-status-positive" : "bg-primary/10 text-primary"}`}>
        {task.status === "COMPLETED" ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <ClipboardList className="size-4" aria-hidden="true" />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground">{task.notes || "مهمة بدون ملاحظات"}</span>
        <span dir="ltr" className="number-ltr mt-0.5 block text-xs text-muted-foreground">#{task.id.slice(0, 8)}</span>
      </span>
    </div>
  );
}

function DueDateValue({ task }: { task: TaskResponse }) {
  const overdue = isTaskOverdue(task);
  return (
    <div className="space-y-1">
      <div className="number-ltr whitespace-nowrap text-sm font-semibold text-foreground">{formatDate(task.dueDate)}</div>
      {overdue && <StatusBadge status="OVERDUE" label="متأخرة" />}
    </div>
  );
}

function TaskStatus({ task }: { task: TaskResponse }) {
  return <StatusBadge status={task.status} />;
}

export function TasksDataList({ tasks, onOpen }: TasksDataListProps) {
  return (
    <>
      <div className="hidden xl:block">
        <Table className="table-fixed">
          <TableHeader className="bg-muted/45"><TableRow><TableHead className="w-[52%]">المهمة</TableHead><TableHead className="w-[17%]">الحالة</TableHead><TableHead className="w-[18%]">تاريخ الاستحقاق</TableHead><TableHead className="w-[13%] text-end">الإجراء</TableHead></TableRow></TableHeader>
          <TableBody>
            {tasks.map((task) => <TableRow key={task.id} className={task.status === "COMPLETED" ? "bg-muted/20" : undefined}><TableCell><TaskTitle task={task} /></TableCell><TableCell><TaskStatus task={task} /></TableCell><TableCell><DueDateValue task={task} /></TableCell><TableCell className="text-end"><Button type="button" variant="outline" size="sm" onClick={() => onOpen(task.id)}>عرض التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button></TableCell></TableRow>)}
          </TableBody>
        </Table>
      </div>

      <div className="hidden divide-y divide-border md:block xl:hidden">
        {tasks.map((task) => <article key={task.id} className={task.status === "COMPLETED" ? "space-y-4 bg-muted/20 px-4 py-4 sm:px-5" : "space-y-4 px-4 py-4 sm:px-5"}><div className="flex items-start justify-between gap-4"><TaskTitle task={task} /><TaskStatus task={task} /></div><div className="grid gap-3 sm:grid-cols-2"><div><div className="ui-label">تاريخ الاستحقاق</div><div className="mt-1"><DueDateValue task={task} /></div></div><div><div className="ui-label">حالة الاستحقاق</div><div className="mt-1 text-sm text-muted-foreground">{isTaskOverdue(task) ? "تحتاج إلى متابعة" : task.status === "COMPLETED" ? "لا تتطلب إجراءً" : "ضمن قائمة المتابعة"}</div></div></div><div className="flex justify-end border-t border-border pt-3"><Button type="button" variant="outline" size="sm" onClick={() => onOpen(task.id)}>عرض التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button></div></article>)}
      </div>

      <div className="divide-y divide-border md:hidden">
        {tasks.map((task) => <article key={task.id} className={task.status === "COMPLETED" ? "space-y-4 bg-muted/20 px-4 py-4" : "space-y-4 px-4 py-4"}><div className="flex items-start justify-between gap-3"><TaskTitle task={task} compact /><TaskStatus task={task} /></div><div className="rounded-lg bg-muted/45 p-3"><div className="ui-label">تاريخ الاستحقاق</div><div className="mt-1 flex items-center gap-2"><CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><DueDateValue task={task} /></div></div><div className="flex items-center justify-between gap-3"><span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground">{task.status === "COMPLETED" ? <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" /> : <Circle className="size-3.5 shrink-0" aria-hidden="true" />}{task.status === "COMPLETED" ? "مهمة مكتملة" : isTaskOverdue(task) ? "مهمة متأخرة" : "مهمة قيد المتابعة"}</span><Button type="button" variant="outline" size="sm" onClick={() => onOpen(task.id)}>التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button></div></article>)}
      </div>
    </>
  );
}

export function TasksDataListSkeleton() {
  return <div aria-label="جارٍ تحميل المهام" className="space-y-0">{[0, 1, 2, 3].map((row) => <div key={row} className="grid grid-cols-4 gap-5 border-b border-border px-5 py-5 last:border-b-0"><div className="h-9 animate-pulse rounded-lg bg-muted" /><div className="h-6 animate-pulse rounded-md bg-muted" /><div className="h-5 animate-pulse rounded-md bg-muted" /><div className="h-8 animate-pulse rounded-md bg-muted" /></div>)}</div>;
}
