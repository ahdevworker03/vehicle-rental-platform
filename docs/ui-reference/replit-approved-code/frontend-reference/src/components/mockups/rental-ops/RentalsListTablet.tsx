import { useMemo, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { AppFrame } from "./_shared/AppFrame";
import { PageHeader, PrimaryButton } from "./_shared/PageHeader";
import { SearchFilters, rentals, RentalStatus } from "./_shared/rentalData";
import { Ltr } from "./_shared/Ltr";

/**
 * Tablet hybrid row: every core field (customer, vehicle, status, expected
 * return + urgency, outstanding balance, primary action) is visible directly —
 * nothing is hidden behind an expand affordance.
 */
export function RentalsListTablet() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(
    () => rentals.filter((r) => (status === "all" || r.status === status) && `${r.customer} ${r.vehicle} ${r.id} ${r.phone} ${r.area}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())),
    [query, status]
  );

  return (
    <AppFrame variant="tablet" active="rentals">
      <PageHeader title="الإيجارات" description="العقود والحجوزات" primaryAction={<PrimaryButton><Plus className="h-4 w-4" />إنشاء إيجار</PrimaryButton>} />
      <SearchFilters query={query} setQuery={setQuery} status={status} setStatus={setStatus} />
      <main className="p-4">
        <div className="overflow-hidden rounded-lg border border-[var(--ro-border)] bg-[var(--ro-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--ro-border)] bg-[var(--ro-bg)] px-4 py-3 text-xs text-[var(--ro-text-muted)]">
            <b className="text-[var(--ro-text)]">قائمة الإيجارات</b>
             <span>{filtered.length} إيجارات معروضة</span>
          </div>
          <table className="w-full table-fixed text-right text-sm">
            <thead className="border-b border-[var(--ro-border)] text-xs text-[var(--ro-text-muted)]">
              <tr>
                <th className="w-[15%] px-3 py-2.5 font-semibold">الحالة</th>
                <th className="w-[21%] px-3 py-2.5 font-semibold pl-[12px] pr-[12px]">العميل</th>
                <th className="w-[17%] px-3 py-2.5 font-semibold">المركبة</th>
                <th className="w-[11%] px-3 py-2.5 font-semibold">الاستلام</th>
                <th className="w-[11%] px-3 py-2.5 font-semibold">الإرجاع</th>
                <th className="w-[10%] px-3 py-2.5 font-semibold">المتبقي</th>
                <th className="w-[15%] px-3 py-2.5 font-semibold">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ro-border)]">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--ro-primary-soft)]/40">
                  <td className="px-3 py-3 align-top"><RentalStatus rental={r} /></td>
                  <td className="px-3 py-3 align-top"><div className="truncate font-semibold text-xs">{r.customer}</div><Ltr className="mt-1 block text-xs text-[var(--ro-text-muted)]">{r.phone}</Ltr></td>
                  <td className="px-3 py-3 align-top"><div className="truncate font-semibold text-xs">{r.vehicle}</div><div className="mt-1 text-xs tabular-nums text-[var(--ro-text-faint)]">{r.plate}</div></td>
                  <td className="whitespace-nowrap px-3 py-3 align-top tabular-nums text-xs">{r.pickup}</td>
                  <td className="whitespace-nowrap px-3 py-3 align-top tabular-nums text-center text-xs">{r.returnDate}</td>
                  <td className="whitespace-nowrap px-3 py-3 align-top font-bold tabular-nums text-xs">{r.balance}</td>
                  <td className="px-3 py-3 align-top"><button className="inline-flex h-8 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--ro-primary)] px-2 font-bold text-[var(--ro-primary)] hover:bg-[var(--ro-primary-soft)] text-[10px]">{r.action}<ArrowRight className="h-3.5 w-3.5 shrink-0" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-[var(--ro-text-muted)]">عرض {filtered.length} من {rentals.length} إيجارات</div>
      </main>
    </AppFrame>
  );
}
