import { Car, ChevronLeft, CircleDollarSign, FileText } from "lucide-react";
import type { ExpenseResponse } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatUsd } from "@/lib/format";
import { ExpenseCategoryBadge } from "./ExpenseCategoryBadge";

interface ExpenseListItem {
  expense: ExpenseResponse;
  vehicleName: string;
  vehiclePlate: string;
}

interface ExpensesDataListProps {
  items: ExpenseListItem[];
  onOpen: (expenseId: string) => void;
}

function VehicleValue({ item, compact = false }: { item: ExpenseListItem; compact?: boolean }) {
  if (!item.expense.vehicleId) return <span className="text-sm text-muted-foreground">مصروف عام</span>;

  if (compact) {
    return (
      <span className="min-w-0">
        <span dir="ltr" className="block break-words text-sm font-semibold leading-5 text-foreground">{item.vehicleName || "—"}</span>
        <span dir="ltr" className="number-ltr mt-0.5 block text-xs text-muted-foreground">{item.vehiclePlate || "—"}</span>
      </span>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Car className="size-4" aria-hidden="true" /></span>
      <span className="min-w-0">
        <span dir="ltr" className="block truncate text-sm font-semibold text-foreground">{item.vehicleName || "—"}</span>
        <span dir="ltr" className="number-ltr mt-0.5 block text-xs text-muted-foreground">{item.vehiclePlate || "—"}</span>
      </span>
    </div>
  );
}

function DescriptionValue({ expense }: { expense: ExpenseResponse }) {
  return expense.description ? <span className="block max-w-56 truncate text-sm text-foreground" title={expense.description}>{expense.description}</span> : <span className="text-sm text-muted-foreground">—</span>;
}

function DateValue({ expense }: { expense: ExpenseResponse }) {
  return <span className="number-ltr whitespace-nowrap text-sm font-semibold text-foreground">{formatDate(expense.expenseDate)}</span>;
}

function AmountValue({ expense }: { expense: ExpenseResponse }) {
  return <span className="number-ltr whitespace-nowrap text-sm font-semibold text-foreground">{formatUsd(expense.amount)}</span>;
}

export function ExpensesDataList({ items, onOpen }: ExpensesDataListProps) {
  return (
    <>
      <div className="hidden xl:block">
        <Table>
          <TableHeader className="bg-muted/45">
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>المركبة</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead className="text-end">المبلغ</TableHead>
              <TableHead className="text-end">الإجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.expense.id} className="cursor-pointer" onClick={() => onOpen(item.expense.id)}>
                <TableCell><DateValue expense={item.expense} /></TableCell>
                <TableCell><ExpenseCategoryBadge category={item.expense.category} /></TableCell>
                <TableCell className="min-w-[15rem]"><VehicleValue item={item} /></TableCell>
                <TableCell><DescriptionValue expense={item.expense} /></TableCell>
                <TableCell className="text-end"><AmountValue expense={item.expense} /></TableCell>
                <TableCell className="text-end"><Button type="button" variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); onOpen(item.expense.id); }}>عرض التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="hidden divide-y divide-border md:block xl:hidden">
        {items.map((item) => (
          <article key={item.expense.id} className="space-y-4 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4"><ExpenseCategoryBadge category={item.expense.category} /><AmountValue expense={item.expense} /></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><div className="ui-label">التاريخ</div><div className="mt-1"><DateValue expense={item.expense} /></div></div>
              <div className="sm:col-span-2"><div className="ui-label">المركبة</div><div className="mt-1"><VehicleValue item={item} /></div></div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3"><span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground"><FileText className="size-3.5 shrink-0" aria-hidden="true" />{item.expense.description || "لا يوجد وصف"}</span><Button type="button" variant="outline" size="sm" onClick={() => onOpen(item.expense.id)}>عرض التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button></div>
          </article>
        ))}
      </div>

      <div className="divide-y divide-border md:hidden">
        {items.map((item) => (
          <article key={item.expense.id} className="space-y-4 px-4 py-4">
            <div className="flex items-start justify-between gap-3"><ExpenseCategoryBadge category={item.expense.category} /><AmountValue expense={item.expense} /></div>
            <div className="space-y-3 rounded-lg bg-muted/45 p-3"><div><div className="ui-label">التاريخ</div><div className="mt-1"><DateValue expense={item.expense} /></div></div><div className="border-t border-border/70 pt-2"><div className="ui-label">المركبة</div><div className="mt-1"><VehicleValue item={item} compact /></div></div></div>
            <div className="flex items-center justify-between gap-3"><span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground"><CircleDollarSign className="size-3.5 shrink-0" aria-hidden="true" />{item.expense.description || "مصروف مسجّل"}</span><Button type="button" variant="outline" size="sm" onClick={() => onOpen(item.expense.id)}>التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button></div>
          </article>
        ))}
      </div>
    </>
  );
}

export function ExpensesDataListSkeleton() {
  return <div aria-label="جارٍ تحميل المصروفات" className="space-y-0">{[0, 1, 2, 3].map((row) => <div key={row} className="grid grid-cols-4 gap-5 border-b border-border px-5 py-5 last:border-b-0"><div className="h-5 animate-pulse rounded-md bg-muted" /><div className="h-6 animate-pulse rounded-md bg-muted" /><div className="h-9 animate-pulse rounded-lg bg-muted" /><div className="h-8 animate-pulse rounded-md bg-muted" /></div>)}</div>;
}
