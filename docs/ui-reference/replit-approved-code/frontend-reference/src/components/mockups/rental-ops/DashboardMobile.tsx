import { AppFrame } from "./_shared/AppFrame";
import { PageHeader, PrimaryButton, SecondaryButton } from "./_shared/PageHeader";
import { AlertItem } from "./_shared/AlertItem";
import { KPICard } from "./_shared/KPICard";
import { StatusBadge } from "./_shared/StatusBadge";
import { vehicleStatus, rentalStatus } from "./_shared/statusConfig";
import { AlertTriangle, ArrowLeft, Car, Clock3, HandCoins, Plus, RefreshCw } from "lucide-react";
import { formatCurrency, formatDateCompact, formatDateLong, formatDateTime, formatPlate, formatTime } from "./_shared/format";

const urgent = [
  { title: "محمد رائد", meta: `Toyota Camry 2023 · ${formatPlate("B", "245781")} · متأخر ساعة و20 دقيقة`, icon: AlertTriangle, tone: "danger" as const, actionLabel: "متابعة العميل" },
  { title: "سارة حداد", meta: `Hyundai Tucson 2022 · ${formatTime(11, 30)} اليوم`, icon: Clock3, tone: "warning" as const, actionLabel: "عرض الإيجار" },
];

export function DashboardMobile() {
  return (
    <AppFrame variant="mobile" active="dashboard">
       <PageHeader title="لوحة التحكم" description={formatDateLong(18, 2, 2024)} primaryAction={<PrimaryButton><Plus className="h-4 w-4" /> إيجار جديد</PrimaryButton>} secondary={<SecondaryButton><RefreshCw className="h-4 w-4" /></SecondaryButton>} />
      <main className="space-y-4 p-4 pb-5">
        <section>
           <div className="mb-2 flex items-center justify-between"><div><h2 className="text-base font-bold">الإرجاعات المستحقة</h2><p className="mt-1 text-sm text-[var(--ro-text-muted)]">تحتاج متابعة الآن</p></div><span className="rounded-md bg-[var(--ro-danger-bg)] px-2 py-1 text-sm font-bold text-[var(--ro-danger)]">2</span></div>
          <div className="space-y-2">{urgent.map((item) => <AlertItem key={item.title} {...item} />)}</div>
        </section>
        <section className="grid grid-cols-2 gap-2.5">
           <KPICard label="الإيجارات النشطة" period="اليوم" value="28" changePct="4%" icon={Car} />
           <KPICard label="إيرادات اليوم" period="مقارنة بالأمس" value={formatCurrency(840).replace(" ", "\u00a0")} changePct="8%" icon={HandCoins} />
           <KPICard label="المبالغ المستحقة" period="هذا الشهر" value={formatCurrency(2450).replace(" ", "\u00a0")} changePct="3%" changeIsGood={false} changeDirection="down" />
           <KPICard label="المهام المفتوحة" period="آخر 30 يوم" value="7" changePct="2%" changeIsGood={false} changeDirection="down" />
        </section>
        <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)]">
           <div className="flex items-center justify-between border-b border-[var(--ro-border)] px-4 py-3"><div><h2 className="text-base font-bold">حالة المركبات</h2><p className="mt-1 text-sm text-[var(--ro-text-muted)]">48 مركبة</p></div><a href="#" className="flex items-center gap-1 text-sm font-semibold text-[var(--ro-primary)]">التفاصيل <ArrowLeft className="h-4 w-4" /></a></div>
           <div className="grid grid-cols-2 gap-4 p-4">{[["available","12"],["rented","28"],["maintenance","5"],["outOfService","3"]].map(([key, value]) => <div key={key}><StatusBadge status={vehicleStatus[key]} size="sm" /><div className="mt-2 font-bold tabular-nums text-lg">{value}</div></div>)}</div>
        </section>
        <section className="overflow-hidden rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)]">
           <div className="flex items-center justify-between border-b border-[var(--ro-border)] px-4 py-3"><h2 className="text-base font-bold">الإيجارات النشطة</h2><a href="#" className="text-sm font-semibold text-[var(--ro-primary)]">عرض الكل</a></div>
           <div className="divide-y divide-[var(--ro-border)]">{[["ليان مراد","Nissan Sunny",formatDateTime(19, 2, 2024, 10),"active"],["جاد منصور","Toyota Corolla",formatDateTime(19, 2, 2024, 14, 30),"active"],["رنا شحادة","Renault Duster",formatDateCompact(20, 2, 2024),"reserved"]].map(([name, car, date, status]) => <div key={name} className="flex items-center gap-3 px-4 py-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ro-primary-soft)] text-sm font-bold text-[var(--ro-primary)]">{name.slice(0, 1)}</div><div className="min-w-0 flex-1"><div className="text-sm font-semibold">{name}</div><div className="mt-1 truncate text-xs text-[var(--ro-text-muted)]">{car} · {date}</div></div><StatusBadge status={rentalStatus[status]} size="sm" /></div>)}</div>
        </section>
      </main>
    </AppFrame>
  );
}