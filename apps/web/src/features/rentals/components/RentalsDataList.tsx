import { Car, ChevronLeft, CircleDollarSign, User } from "lucide-react";
import type { RentalResponse } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface RentalListItem {
  rental: RentalResponse;
  customerName: string;
  customerPhone?: string;
  vehicleName: string;
  vehiclePlate: string;
  outstandingBalance: number | null;
}

interface RentalsDataListProps {
  items: RentalListItem[];
  onOpen: (rentalId: string) => void;
}

type ReturnUrgency = "overdue" | "today" | "upcoming";

function getReturnUrgency(rental: RentalResponse): ReturnUrgency | null {
  if (rental.status !== "ACTIVE") return null;

  const milliseconds =
    new Date(rental.expectedReturnDate).getTime() - Date.now();
  const days = Math.ceil(milliseconds / (24 * 60 * 60 * 1000));

  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 2) return "upcoming";
  return null;
}

function RentalStatusCluster({ rental }: { rental: RentalResponse }) {
  const urgency = getReturnUrgency(rental);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <StatusBadge status={rental.status} />
      {urgency && (
        <StatusBadge
          status={urgency === "overdue" ? "OVERDUE" : "upcoming"}
          label={
            urgency === "overdue"
              ? "متأخر"
              : urgency === "today"
                ? "مستحق اليوم"
                : "إعادة قريبة"
          }
        />
      )}
    </div>
  );
}

function PaymentSummary({
  item,
  compact = false,
}: {
  item: RentalListItem;
  compact?: boolean;
}) {
  if (item.outstandingBalance === null) {
    return (
      <span
        className="text-xs text-muted-foreground"
        aria-label="جارٍ تحميل حالة الدفع"
      >
        جارٍ تحميل الرصيد
      </span>
    );
  }

  const paymentStatus = item.outstandingBalance === 0 ? "PAID" : "OUTSTANDING";

  return (
    <div className={cn("min-w-0", compact ? "space-y-1" : "space-y-1.5")}>
      <div dir="ltr" className="number-ltr text-sm font-medium text-foreground">
        {formatCurrency(item.rental.totalAmount)}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span>المتبقي:</span>
        <span dir="ltr" className="number-ltr whitespace-nowrap">
          {formatCurrency(item.outstandingBalance)}
        </span>
        <StatusBadge status={paymentStatus} />
      </div>
    </div>
  );
}

function PrimaryAction({
  rental,
  onOpen,
  className,
}: {
  rental: RentalResponse;
  onOpen: () => void;
  className?: string;
}) {
  const label =
    rental.status === "RESERVED"
      ? "تسجيل الاستلام"
      : rental.status === "ACTIVE"
        ? "إعادة المركبة"
        : "عرض التفاصيل";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onOpen}
      className={cn("shrink-0", className)}
    >
      {label}
      <ChevronLeft className="size-4" aria-hidden="true" />
    </Button>
  );
}

function RentalIdentity({
  item,
  withPhone = false,
}: {
  item: RentalListItem;
  withPhone?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <div className="truncate font-semibold text-foreground">
        {item.customerName}
      </div>
      {withPhone && item.customerPhone && (
        <div className="number-ltr truncate text-xs text-muted-foreground">
          {item.customerPhone}
        </div>
      )}
      <div className="flex min-w-0 items-center gap-1.5 text-sm text-foreground">
        <Car className="size-4 shrink-0 text-status-info" aria-hidden="true" />
        <span className="truncate" dir="ltr">
          {item.vehicleName}
        </span>
      </div>
      <div className="number-ltr text-xs text-muted-foreground">
        {item.vehiclePlate}
      </div>
    </div>
  );
}

function CustomerIdentity({ item }: { item: RentalListItem }) {
  return (
    <div className="min-w-0 text-right">
      <div dir="auto" className="truncate text-sm font-medium text-foreground">
        {item.customerName}
      </div>
      {item.customerPhone && (
        <div
          dir="ltr"
          className="number-ltr mt-0.5 truncate text-right text-xs text-muted-foreground"
        >
          {item.customerPhone}
        </div>
      )}
    </div>
  );
}

function VehicleIdentity({ item }: { item: RentalListItem }) {
  return (
    <div className="min-w-0 text-right">
      <span
        dir="auto"
        className="block truncate text-sm font-medium text-foreground"
      >
        {item.vehicleName}
      </span>
      <span
        dir="ltr"
        className="number-ltr mt-0.5 block truncate text-right text-xs text-muted-foreground"
      >
        {item.vehiclePlate}
      </span>
    </div>
  );
}

function RentalDate({ value }: { value: string }) {
  return (
    <span
      dir="ltr"
      className="number-ltr block whitespace-nowrap text-end text-sm font-medium text-foreground"
    >
      {formatDate(value)}
    </span>
  );
}

function DatePair({ rental }: { rental: RentalResponse }) {
  return (
    <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
      <div>
        <div className="mb-1 text-muted-foreground">الاستلام</div>
        <div className="number-ltr font-medium text-foreground">
          {formatDate(rental.pickupDate)}
        </div>
      </div>
      <div>
        <div className="mb-1 text-muted-foreground">الإرجاع المتوقع</div>
        <div className="number-ltr font-medium text-foreground">
          {formatDate(rental.expectedReturnDate)}
        </div>
      </div>
    </div>
  );
}

export function RentalsDataList({ items, onOpen }: RentalsDataListProps) {
  return (
    <>
      <div className="hidden xl:block">
        <Table className="table-fixed">
          <TableHeader className="bg-muted/45">
            <TableRow>
              <TableHead className="w-[10%] text-start">الحالة</TableHead>
              <TableHead className="w-[17%] text-start">العميل</TableHead>
              <TableHead className="w-[17%] text-start">المركبة</TableHead>
              <TableHead className="w-[11%] text-end">الاستلام</TableHead>
              <TableHead className="w-[13%] text-end">
                الإرجاع المتوقع
              </TableHead>
              <TableHead className="w-[20%] text-start">
                المبلغ والدفع
              </TableHead>
              <TableHead className="w-[12%] text-end">الإجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.rental.id}>
                <TableCell className="py-3.5 align-middle">
                  <RentalStatusCluster rental={item.rental} />
                </TableCell>
                <TableCell className="py-3.5 align-middle">
                  <CustomerIdentity item={item} />
                </TableCell>
                <TableCell className="py-3.5 align-middle">
                  <VehicleIdentity item={item} />
                </TableCell>
                <TableCell className="py-3.5 align-middle text-end">
                  <RentalDate value={item.rental.pickupDate} />
                </TableCell>
                <TableCell className="py-3.5 align-middle text-end">
                  <RentalDate value={item.rental.expectedReturnDate} />
                </TableCell>
                <TableCell className="py-3.5 align-middle">
                  <PaymentSummary item={item} />
                </TableCell>
                <TableCell className="py-3.5 align-middle text-end whitespace-nowrap">
                  <PrimaryAction
                    rental={item.rental}
                    onOpen={() => onOpen(item.rental.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="hidden divide-y divide-border md:block xl:hidden">
        {items.map((item) => (
          <article key={item.rental.id} className="space-y-4 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <RentalIdentity item={item} withPhone />
              <RentalStatusCluster rental={item.rental} />
            </div>
            <div className="grid grid-cols-2 gap-4 border-y border-border py-3">
              <DatePair rental={item.rental} />
              <PaymentSummary item={item} compact />
            </div>
            <div className="flex justify-end">
              <PrimaryAction
                rental={item.rental}
                onOpen={() => onOpen(item.rental.id)}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="divide-y divide-border md:hidden">
        {items.map((item) => (
          <article key={item.rental.id} className="space-y-4 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="size-3.5" aria-hidden="true" /> العميل
                </div>
                <RentalIdentity item={item} withPhone />
              </div>
              <RentalStatusCluster rental={item.rental} />
            </div>
            <div className="rounded-lg bg-muted/45 p-3">
              <DatePair rental={item.rental} />
            </div>
            <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CircleDollarSign className="size-3.5" aria-hidden="true" />{" "}
                  المدفوعات
                </div>
                <PaymentSummary item={item} compact />
              </div>
              <PrimaryAction
                rental={item.rental}
                onOpen={() => onOpen(item.rental.id)}
                className="mt-5"
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export function RentalsDataListSkeleton() {
  return (
    <div
      className="space-y-3 p-4 sm:p-5"
      aria-busy="true"
      aria-label="جارٍ تحميل الإيجارات"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-2 items-center gap-4 rounded-lg border border-border p-4 md:grid-cols-4 lg:grid-cols-7"
        >
          <Skeleton className="h-6 w-20 rounded-md bg-muted" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 bg-muted" />
            <Skeleton className="h-3 w-20 bg-muted" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-muted" />
            <Skeleton className="h-3 w-16 bg-muted" />
          </div>
          <Skeleton className="h-4 w-20 bg-muted" />
          <Skeleton className="h-4 w-20 bg-muted" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-muted" />
            <Skeleton className="h-3 w-16 bg-muted" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  );
}
