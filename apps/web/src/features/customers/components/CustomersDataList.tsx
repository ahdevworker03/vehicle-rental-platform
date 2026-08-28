import { ChevronLeft, Phone, UserRound } from "lucide-react";
import type { CustomerResponse } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CustomersDataListProps {
  customers: CustomerResponse[];
  onOpen: (customerId: string) => void;
}

function CustomerIdentity({ customer }: { customer: CustomerResponse }) {
  const fullName = `${customer.firstName} ${customer.lastName}`.trim();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <UserRound className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground">{fullName}</span>
        <span className="number-ltr mt-0.5 block text-xs text-muted-foreground">{customer.phone}</span>
      </span>
    </div>
  );
}

function IdentityValue({ value }: { value: string }) {
  return <span dir="ltr" className="number-ltr whitespace-nowrap text-sm font-semibold text-foreground">{value}</span>;
}

export function CustomersDataList({ customers, onOpen }: CustomersDataListProps) {
  return (
    <>
      <div className="hidden xl:block">
        <Table>
          <TableHeader className="bg-muted/45">
            <TableRow>
              <TableHead>العميل</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>رقم الهوية</TableHead>
              <TableHead>رقم الرخصة</TableHead>
              <TableHead className="text-end">الإجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="cursor-pointer" onClick={() => onOpen(customer.id)}>
                <TableCell className="min-w-[18rem]"><CustomerIdentity customer={customer} /></TableCell>
                <TableCell><IdentityValue value={customer.phone} /></TableCell>
                <TableCell><IdentityValue value={customer.nationalId} /></TableCell>
                <TableCell><IdentityValue value={customer.licenseNumber} /></TableCell>
                <TableCell className="text-end">
                  <Button type="button" variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); onOpen(customer.id); }}>
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
        {customers.map((customer) => (
          <article key={customer.id} className="space-y-4 px-4 py-4 sm:px-5">
            <CustomerIdentity customer={customer} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div><div className="ui-label">رقم الهوية</div><div className="mt-1"><IdentityValue value={customer.nationalId} /></div></div>
              <div><div className="ui-label">رقم الرخصة</div><div className="mt-1"><IdentityValue value={customer.licenseNumber} /></div></div>
            </div>
            <div className="flex justify-end border-t border-border pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpen(customer.id)}>عرض التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button>
            </div>
          </article>
        ))}
      </div>

      <div className="divide-y divide-border md:hidden">
        {customers.map((customer) => (
          <article key={customer.id} className="space-y-4 px-4 py-4">
            <CustomerIdentity customer={customer} />
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/45 p-3">
              <div><div className="ui-label">الهوية</div><div className="mt-1"><IdentityValue value={customer.nationalId} /></div></div>
              <div><div className="ui-label">الرخصة</div><div className="mt-1"><IdentityValue value={customer.licenseNumber} /></div></div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><Phone className="size-3.5 shrink-0" aria-hidden="true" /><span dir="ltr" className="number-ltr truncate">{customer.phone}</span></span>
              <Button type="button" variant="outline" size="sm" onClick={() => onOpen(customer.id)}>التفاصيل<ChevronLeft className="size-4" aria-hidden="true" /></Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export function CustomersDataListSkeleton() {
  return (
    <div aria-label="جارٍ تحميل العملاء" className="space-y-0">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="grid grid-cols-4 gap-5 border-b border-border px-5 py-5 last:border-b-0">
          <div className="h-9 animate-pulse rounded-lg bg-muted" />
          <div className="h-5 animate-pulse rounded-md bg-muted" />
          <div className="h-5 animate-pulse rounded-md bg-muted" />
          <div className="h-8 animate-pulse rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}
