import { Car, ChevronLeft, Gauge, Settings2 } from "lucide-react";
import type { VehicleResponse } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/lib/format";

interface VehiclesDataListProps {
  vehicles: VehicleResponse[];
  onOpen: (vehicleId: string) => void;
}

function VehicleIdentity({ vehicle }: { vehicle: VehicleResponse }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-3 xl:min-w-[17rem]" dir="rtl">
      <span className="min-w-0 text-right">
        <span dir="auto" className="block truncate text-sm font-semibold text-foreground">{vehicle.make} {vehicle.model}</span>
        <span dir="ltr" className="number-ltr mt-0.5 block truncate text-right text-xs text-muted-foreground">{vehicle.plateNumber}</span>
      </span>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Car className="size-4" aria-hidden="true" />
      </span>
    </div>
  );
}

function VehicleSpecification({ vehicle }: { vehicle: VehicleResponse }) {
  return (
    <div className="flex items-center gap-1.5 text-start text-xs text-muted-foreground">
      <Settings2 className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{vehicle.transmission === "AUTOMATIC" ? "أوتوماتيك" : "يدوي"} · {vehicle.fuelType === "PETROL" ? "بنزين" : vehicle.fuelType === "DIESEL" ? "ديزل" : vehicle.fuelType === "ELECTRIC" ? "كهرباء" : "هايبرد"}</span>
    </div>
  );
}

function VehicleYear({ value }: { value: number }) {
  return <span className="number-ltr whitespace-nowrap text-sm font-semibold text-foreground">{value}</span>;
}

function Mileage({ value }: { value: number }) {
  return <span className="number-ltr whitespace-nowrap text-sm font-semibold text-foreground">{formatNumber(value)} كم</span>;
}

export function VehiclesDataList({ vehicles, onOpen }: VehiclesDataListProps) {
  return (
    <>
      <div className="hidden xl:block">
        <Table className="min-w-[73rem] table-fixed">
          <TableHeader className="bg-muted/45">
            <TableRow>
              <TableHead className="w-[22rem] min-w-[22rem]">المركبة</TableHead>
              <TableHead className="w-[9rem] min-w-[9rem]">الحالة</TableHead>
              <TableHead className="w-[16rem] min-w-[16rem]">المواصفات</TableHead>
              <TableHead className="w-[6rem] min-w-[6rem] text-end">السنة</TableHead>
              <TableHead className="w-[10rem] min-w-[10rem] text-end">العداد</TableHead>
              <TableHead className="w-[10rem] min-w-[10rem] text-end">الإجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="min-w-[22rem]"><VehicleIdentity vehicle={vehicle} /></TableCell>
                <TableCell className="min-w-[9rem]"><StatusBadge status={vehicle.status} /></TableCell>
                <TableCell className="min-w-[16rem]"><VehicleSpecification vehicle={vehicle} /></TableCell>
                <TableCell className="min-w-[6rem] text-end"><VehicleYear value={vehicle.year} /></TableCell>
                <TableCell className="min-w-[10rem] text-end"><Mileage value={vehicle.currentMileage} /></TableCell>
                <TableCell className="min-w-[10rem] text-end whitespace-nowrap">
                  <Button type="button" variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); onOpen(vehicle.id); }}>
                    عرض التفاصيل
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="hidden divide-y divide-border md:block xl:hidden">
        {vehicles.map((vehicle) => (
          <article key={vehicle.id} className="space-y-4 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <VehicleIdentity vehicle={vehicle} />
              <StatusBadge status={vehicle.status} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><div className="ui-label">المواصفات</div><div className="mt-1"><VehicleSpecification vehicle={vehicle} /></div></div>
              <div><div className="ui-label">السنة</div><div className="mt-1"><VehicleYear value={vehicle.year} /></div></div>
              <div><div className="ui-label">العداد الحالي</div><div className="mt-1"><Mileage value={vehicle.currentMileage} /></div></div>
            </div>
            <div className="flex justify-end border-t border-border pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpen(vehicle.id)}>عرض التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button>
            </div>
          </article>
        ))}
      </div>

      <div className="divide-y divide-border md:hidden">
        {vehicles.map((vehicle) => (
          <article key={vehicle.id} className="space-y-4 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <VehicleIdentity vehicle={vehicle} />
              <StatusBadge status={vehicle.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/45 p-3">
              <div><div className="ui-label">السنة</div><div className="mt-1"><VehicleYear value={vehicle.year} /></div></div>
              <div><div className="ui-label">العداد</div><div className="mt-1"><Mileage value={vehicle.currentMileage} /></div></div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Gauge className="size-3.5" aria-hidden="true" />{vehicle.transmission === "AUTOMATIC" ? "أوتوماتيك" : "يدوي"} · {vehicle.seats} مقاعد</div>
              <Button type="button" variant="outline" size="sm" onClick={() => onOpen(vehicle.id)}>التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export function VehiclesDataListSkeleton() {
  return (
    <div className="space-y-0" aria-label="جارٍ تحميل المركبات">
      {[0, 1, 2, 3].map((row) => <div key={row} className="grid grid-cols-4 gap-5 border-b border-border px-5 py-5 last:border-b-0"><div className="h-9 animate-pulse rounded-lg bg-muted" /><div className="h-6 animate-pulse rounded-md bg-muted" /><div className="h-8 animate-pulse rounded-md bg-muted" /><div className="h-8 animate-pulse rounded-md bg-muted" /></div>)}
    </div>
  );
}
