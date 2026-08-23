import { useMemo, useState } from "react";
import { ArrowRight, ClipboardList, Download, Plus } from "lucide-react";
import { AppFrame } from "./_shared/AppFrame";
import { PageHeader, PrimaryButton, SecondaryButton } from "./_shared/PageHeader";
import { SearchFilters, rentals, RentalStatus } from "./_shared/rentalData";
import { paymentStatus } from "./_shared/statusConfig";
import { StatusBadge } from "./_shared/StatusBadge";
import { Ltr } from "./_shared/Ltr";

function PaymentCell({ rental }: { rental: (typeof rentals)[number] }) {
  return (
    <div className="flex min-w-[132px] flex-col items-start gap-2">
      <span className="text-sm font-bold tabular-nums text-[var(--ro-text)]">{rental.total}</span>
      <span className="text-xs text-[var(--ro-text-muted)]">المتبقي: {rental.balance}</span>
      <StatusBadge status={paymentStatus[rental.payment]} size="sm" />
    </div>
  );
}

export function RentalsListDesktop() {
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("all");
   const filtered = useMemo(() => rentals.filter((r) => (status === "all" || r.status === status) && `${r.customer} ${r.vehicle} ${r.id} ${r.phone} ${r.area}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [query, status]);
  return <AppFrame variant="desktop" active="rentals">
    <PageHeader title="الإيجارات" description="متابعة العقود الحالية والحجوزات وحالات الإرجاع" primaryAction={<PrimaryButton><Plus className="h-4 w-4" />إنشاء إيجار</PrimaryButton>} secondary={<SecondaryButton><Download className="h-4 w-4" />تصدير</SecondaryButton>} />
     <div className="border-b border-[var(--ro-border)] bg-[var(--ro-bg)] px-6 py-4"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-[var(--ro-text-muted)]">نظرة سريعة</div><div className="mt-1 text-sm"><b className="text-[var(--ro-text)]">{filtered.length}</b> إيجارات معروضة <span className="mx-2 text-[var(--ro-border)]">|</span><b className="text-[var(--ro-danger)]">{rentals.filter((r) => r.urgency === "overdue").length}</b> تحتاج إجراء اليوم</div></div><div className="flex items-center gap-2 text-sm text-[var(--ro-text-muted)]"><ClipboardList className="h-4 w-4" />آخر تحديث: منذ 3 دقائق</div></div></div>
    <SearchFilters query={query} setQuery={setQuery} status={status} setStatus={setStatus} />
    <main className="p-6"><div className="overflow-hidden rounded-lg border border-[var(--ro-border)] bg-[var(--ro-surface)]">
       <table className="w-full table-fixed text-right text-sm"><thead className="border-b border-[var(--ro-border)] bg-[var(--ro-bg)] text-sm text-[var(--ro-text-muted)]"><tr><th className="w-[18%] px-4 py-3.5 font-semibold">العميل</th><th className="w-[17%] px-4 py-3.5 font-semibold">المركبة</th><th className="w-[11%] px-4 py-3.5 font-semibold">الحالة</th><th className="w-[10%] px-4 py-3.5 font-semibold">الاستلام</th><th className="w-[11%] px-4 py-3.5 font-semibold">الإرجاع</th><th className="w-[14%] px-4 py-3.5 font-semibold">المبلغ والدفع</th><th className="w-[19%] px-4 py-3.5 font-semibold">الإجراء</th></tr></thead>
       <tbody className="divide-y divide-[var(--ro-border)]">{filtered.map((r) => <tr key={r.id} className="hover:bg-[var(--ro-primary-soft)]/40"><td className="px-4 py-4 align-top"><div className="font-semibold">{r.customer}</div><Ltr className="mt-1 text-xs text-[var(--ro-text-muted)]">{r.phone}</Ltr><div className="mt-1 text-xs text-[var(--ro-text-faint)]">{r.area}</div></td><td className="px-4 py-4 align-top"><div className="font-semibold leading-5">{r.vehicle}</div><div className="mt-1 text-xs tabular-nums text-[var(--ro-text-faint)]">{r.plate}</div></td><td className="px-4 py-4 align-top"><RentalStatus rental={r} /></td><td className="whitespace-nowrap px-4 py-4 align-top tabular-nums text-sm">{r.pickup}</td><td className="whitespace-nowrap px-4 py-4 align-top tabular-nums text-sm">{r.returnDate}</td><td className="px-4 py-4 align-top"><PaymentCell rental={r} /></td><td className="px-4 py-4 align-top"><button className="inline-flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--ro-primary)] px-2 text-xs font-bold text-[var(--ro-primary)] hover:bg-[var(--ro-primary-soft)]">{r.action}<ArrowRight className="h-4 w-4 shrink-0" /></button></td></tr>)}</tbody></table>
      {filtered.length === 0 && <div className="p-12 text-center text-sm text-[var(--ro-text-muted)]">لا توجد إيجارات مطابقة للفلاتر الحالية</div>}
     </div><div className="mt-4 flex items-center justify-end text-sm text-[var(--ro-text-muted)]"><button className="h-10 rounded-lg border border-[var(--ro-border)] px-4 font-semibold hover:bg-[var(--ro-surface)]">الصفحة التالية</button></div></main>
  </AppFrame>;
}
