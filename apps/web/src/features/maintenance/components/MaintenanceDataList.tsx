import { Car, ChevronLeft, CircleDollarSign, Store } from "lucide-react";
import type { MaintenanceResponse } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDisplayStatus } from "@/features/maintenance/selectors";
import { formatDate, formatNumber, formatUsd } from "@/lib/format";
import { MAINTENANCE_TYPES } from "@/lib/labels";

interface MaintenanceListItem {
  record: MaintenanceResponse;
  vehicleName: string;
  vehiclePlate: string;
}

interface MaintenanceDataListProps {
  items: MaintenanceListItem[];
  onOpen: (maintenanceId: string) => void;
}

function dueLabel(record: MaintenanceResponse): { label: string; className: string } | null {
  const displayStatus = getDisplayStatus(record);
  if (displayStatus === "completed") return null;

  const days = Math.ceil((new Date(record.maintenanceDate).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: `متأخرة ${formatNumber(Math.abs(days))} يوم`, className: "text-status-danger" };
  if (days === 0) return { label: "مستحقة اليوم", className: "text-status-warning" };
  return { label: `بعد ${formatNumber(days)} يوم`, className: "text-status-warning" };
}

function VehicleIdentity({ item }: { item: MaintenanceListItem }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Car className="size-4" aria-hidden="true" /></span>
      <span className="min-w-0">
        <span dir="ltr" className="block truncate text-sm font-semibold text-foreground">{item.vehicleName}</span>
        <span dir="ltr" className="number-ltr mt-0.5 block text-xs text-muted-foreground">{item.vehiclePlate || "—"}</span>
      </span>
    </div>
  );
}

function TypeValue({ record }: { record: MaintenanceResponse }) {
  const type = MAINTENANCE_TYPES[record.type];
  const Icon = type.icon;
  return <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground"><Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />{type.label}</span>;
}

function DateValue({ record }: { record: MaintenanceResponse }) {
  const due = dueLabel(record);
  return (
    <div className="space-y-1">
      <div className="number-ltr whitespace-nowrap text-sm font-semibold text-foreground">{formatDate(record.maintenanceDate)}</div>
      {due && <div className={`text-xs font-medium ${due.className}`}>{due.label}</div>}
    </div>
  );
}

function CostValue({ record }: { record: MaintenanceResponse }) {
  return <span className="number-ltr whitespace-nowrap text-sm font-semibold text-foreground">{record.cost == null ? "—" : formatUsd(record.cost)}</span>;
}

export function MaintenanceDataList({ items, onOpen }: MaintenanceDataListProps) {
  return (
    <>
      <div className="hidden xl:block">
        <Table className="table-fixed">
          <TableHeader className="bg-muted/45"><TableRow><TableHead className="w-[24%]">المركبة</TableHead><TableHead className="w-[15%]">نوع الصيانة</TableHead><TableHead className="w-[13%]">الحالة</TableHead><TableHead className="w-[15%]">الموعد</TableHead><TableHead className="w-[11%] text-end">التكلفة</TableHead><TableHead className="w-[12%]">الورشة / المزوّد</TableHead><TableHead className="w-[10%] text-end">الإجراء</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.record.id}>
                <TableCell><VehicleIdentity item={item} /></TableCell>
                <TableCell><TypeValue record={item.record} /></TableCell>
                <TableCell><StatusBadge status={item.record.status} /></TableCell>
                <TableCell><DateValue record={item.record} /></TableCell>
                <TableCell className="text-end"><CostValue record={item.record} /></TableCell>
                <TableCell className="max-w-44 truncate text-sm text-foreground">{item.record.vendor || "—"}</TableCell>
                <TableCell className="text-end"><Button type="button" variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); onOpen(item.record.id); }}>عرض التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="hidden divide-y divide-border md:block xl:hidden">
        {items.map((item) => (
          <article key={item.record.id} className="space-y-4 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4"><VehicleIdentity item={item} /><StatusBadge status={item.record.status} /></div>
            <div className="grid gap-3 sm:grid-cols-3"><div><div className="ui-label">النوع</div><div className="mt-1"><TypeValue record={item.record} /></div></div><div><div className="ui-label">الموعد</div><div className="mt-1"><DateValue record={item.record} /></div></div><div><div className="ui-label">التكلفة</div><div className="mt-1"><CostValue record={item.record} /></div></div></div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3"><span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground"><Store className="size-3.5 shrink-0" aria-hidden="true" />{item.record.vendor || "لم تُحدّد ورشة"}</span><Button type="button" variant="outline" size="sm" onClick={() => onOpen(item.record.id)}>عرض التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button></div>
          </article>
        ))}
      </div>

      <div className="divide-y divide-border md:hidden">
        {items.map((item) => (
          <article key={item.record.id} className="space-y-4 px-4 py-4">
            <div className="flex items-start justify-between gap-3"><VehicleIdentity item={item} /><StatusBadge status={item.record.status} /></div>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/45 p-3"><div><div className="ui-label">النوع</div><div className="mt-1"><TypeValue record={item.record} /></div></div><div><div className="ui-label">الموعد</div><div className="mt-1"><DateValue record={item.record} /></div></div></div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3"><div className="min-w-0"><div className="ui-label">التكلفة</div><div className="mt-1 flex items-center gap-1.5"><CircleDollarSign className="size-3.5 text-muted-foreground" aria-hidden="true" /><CostValue record={item.record} /></div></div><Button type="button" variant="outline" size="sm" onClick={() => onOpen(item.record.id)}>التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button></div>
          </article>
        ))}
      </div>
    </>
  );
}

export function MaintenanceDataListSkeleton() {
  return <div aria-label="جارٍ تحميل سجلات الصيانة" className="space-y-0">{[0, 1, 2, 3].map((row) => <div key={row} className="grid grid-cols-4 gap-5 border-b border-border px-5 py-5 last:border-b-0"><div className="h-9 animate-pulse rounded-lg bg-muted" /><div className="h-5 animate-pulse rounded-md bg-muted" /><div className="h-6 animate-pulse rounded-md bg-muted" /><div className="h-8 animate-pulse rounded-md bg-muted" /></div>)}</div>;
}
