import { AppFrame } from "./_shared/AppFrame";
import { PageHeader, PrimaryButton, SecondaryButton } from "./_shared/PageHeader";
import { StatusBadge } from "./_shared/StatusBadge";
import { KPICard } from "./_shared/KPICard";
import { AlertItem } from "./_shared/AlertItem";
import { rentalStatus, vehicleStatus, maintenanceStatus, taskStatus } from "./_shared/statusConfig";
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  ClipboardList,
  Clock3,
  Gauge,
  HandCoins,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { formatCurrency, formatDateCompact, formatDateLong, formatDateTime, formatPlate } from "./_shared/format";

const returns = [
  { name: "محمد رائد", car: `Toyota Camry 2023 · ${formatPlate("B", "245781")}`, time: "متأخر ساعة و20 دقيقة", tone: "danger" as const, icon: AlertTriangle, action: "متابعة العميل" },
  { name: "سارة حداد", car: `Hyundai Tucson 2022 · ${formatPlate("G", "903112")}`, time: `موعد الإرجاع اليوم — ${formatDateTime(18, 2, 2024, 11, 30).split(" — ")[1]}`, tone: "warning" as const, icon: Clock3, action: "عرض الإيجار" },
  { name: "عمر الخطيب", car: `Kia Sportage · ${formatPlate("R", "410229")}`, time: `موعد الإرجاع اليوم — ${formatDateTime(18, 2, 2024, 15).split(" — ")[1]}`, tone: "warning" as const, icon: Clock3, action: "عرض الإيجار" },
];

export function DashboardDesktop() {
  return (
    <AppFrame variant="desktop" active="dashboard">
      <PageHeader
        title="لوحة التحكم"
         description={`${formatDateLong(18, 2, 2024)} · فرع الحمرا`}
        primaryAction={<PrimaryButton><Plus className="h-4 w-4" /> إنشاء إيجار</PrimaryButton>}
        secondary={<SecondaryButton><RefreshCw className="h-4 w-4" /> تحديث</SecondaryButton>}
      />
      <main className="space-y-5 p-5 xl:p-6">
        <section aria-labelledby="urgent-heading">
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <h2 id="urgent-heading" className="text-base font-bold text-[var(--ro-text)]">الإرجاعات المستحقة</h2>
              <p className="mt-1 text-sm text-[var(--ro-text-muted)]">3 إيجارات تحتاج إلى متابعة اليوم</p>
            </div>
            <a href="#" className="flex items-center gap-1 text-xs font-semibold text-[var(--ro-primary)]">كل الإيجارات <ArrowLeft className="h-3.5 w-3.5" /></a>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {returns.map((item) => <AlertItem key={item.name} icon={item.icon} tone={item.tone} meta={`${item.car} · ${item.time}`} title={item.name} actionLabel={item.action} />)}
          </div>
        </section>

        <section aria-label="المؤشرات اليومية" className="grid grid-cols-4 gap-3">
           <KPICard label="الإيجارات النشطة" period="اليوم" value="28" changePct="4%" icon={Car} />
           <KPICard label="إيرادات اليوم" period="مقارنة بالأمس" value={formatCurrency(840).replace(" ", "\u00a0")} changePct="12.4%" icon={HandCoins} />
           <KPICard label="المبالغ المستحقة" period="هذا الشهر" value={formatCurrency(2450).replace(" ", "\u00a0")} changePct="8.2%" changeIsGood={false} changeDirection="down" icon={Gauge} />
           <KPICard label="المهام المفتوحة" period="آخر 30 يوم" value="7" changePct="2%" changeIsGood={false} changeDirection="down" icon={ClipboardList} />
        </section>

        <div className="grid grid-cols-[1.15fr_0.85fr] gap-5">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)]">
              <div className="flex items-center justify-between border-b border-[var(--ro-border)] px-4 py-3">
                 <div><h2 className="text-base font-bold">حالة المركبات</h2><p className="mt-1 text-sm text-[var(--ro-text-muted)]">إجمالي 48 مركبة مسجلة</p></div>
                 <a href="#" className="text-sm font-semibold text-[var(--ro-primary)]">إدارة المركبات</a>
              </div>
              <div className="grid grid-cols-4 divide-x divide-x-reverse divide-[var(--ro-border)]">
                {[
                   ["متاحة", "12", "available"], ["مؤجرة", "28", "rented"], ["في الصيانة", "5", "maintenance"], ["خارج الخدمة", "3", "outOfService"],
                 ].map(([label, value, key]) => <div key={key} className="p-4"><StatusBadge status={vehicleStatus[key]} size="sm" /><div className="mt-3 text-2xl font-bold tabular-nums">{value}</div><div className="mt-1 text-[11px] text-[var(--ro-text-faint)]">من إجمالي المركبات</div></div>)}
              </div>
              <div className="px-4 pb-4"><div className="flex h-2 overflow-hidden rounded-full bg-[var(--ro-neutral-bg)]"><span className="bg-[var(--ro-success)]" style={{ width: "25%" }} /><span className="bg-[var(--ro-info)]" style={{ width: "58%" }} /><span className="bg-[var(--ro-warning)]" style={{ width: "10%" }} /><span className="bg-[var(--ro-danger)]" style={{ width: "7%" }} /></div></div>
            </section>

            <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)]">
               <div className="flex items-center justify-between border-b border-[var(--ro-border)] px-4 py-3"><div><h2 className="text-base font-bold">الإيجارات النشطة</h2><p className="mt-1 text-sm text-[var(--ro-text-muted)]">آخر نشاط على المركبات</p></div><a href="#" className="text-sm font-semibold text-[var(--ro-primary)]">عرض الكل</a></div>
               <table className="w-full text-right text-sm"><thead className="bg-[var(--ro-bg)] text-[var(--ro-text-faint)]"><tr><th className="px-4 py-3 font-semibold">العميل</th><th className="px-4 py-3 font-semibold">المركبة</th><th className="px-4 py-3 font-semibold">الإرجاع</th><th className="px-4 py-3 font-semibold">الحالة</th><th /></tr></thead><tbody className="divide-y divide-[var(--ro-border)]">{[["ليان مراد","Nissan Sunny",formatDateTime(19, 2, 2024, 10),"active"],["جاد منصور","Toyota Corolla",formatDateTime(19, 2, 2024, 14, 30),"active"],["رنا شحادة","Renault Duster",formatDateCompact(20, 2, 2024),"reserved"]].map((row) => <tr key={row[0]} className="hover:bg-[var(--ro-primary-soft)]/40"><td className="px-4 py-3 font-semibold">{row[0]}</td><td className="px-4 py-3 text-[var(--ro-text-muted)]">{row[1]}</td><td className="px-4 py-3 text-[var(--ro-text-muted)] whitespace-nowrap">{row[2]}</td><td className="px-4 py-3"><StatusBadge status={rentalStatus[row[3]]} size="sm" /></td><td className="px-4 py-3 text-left"><button aria-label="خيارات" className="rounded p-1 text-[var(--ro-text-faint)] hover:bg-[var(--ro-bg)]"><MoreHorizontal className="h-4 w-4" /></button></td></tr>)}</tbody></table>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)]">
               <div className="flex items-center justify-between border-b border-[var(--ro-border)] px-4 py-3"><div><h2 className="text-base font-bold">الصيانة والمهام</h2><p className="mt-1 text-sm text-[var(--ro-text-muted)]">ما يحتاج إلى انتباه الفريق</p></div><Wrench className="h-5 w-5 text-[var(--ro-text-faint)]" /></div>
              <div className="divide-y divide-[var(--ro-border)]">
                 {[["تغيير زيت · Toyota Yaris","متأخرة","maintenanceStatus","overdue"],["فحص دوري · Kia Cerato","غدًا، 09:00 AM","maintenanceStatus","scheduled"],["تأكيد تسليم السيارة · محمد رائد","مستحقة اليوم","taskStatus","dueToday"],["رفع إيصال التأمين · فرع الحمرا","قادمة","taskStatus","upcoming"]].map(([title, meta, type, key]) => <div key={title} className="flex items-center gap-3 px-4 py-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ro-primary-soft)] text-[var(--ro-primary)]">{type === "taskStatus" ? <ClipboardList className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{title}</div><div className="mt-1 text-xs text-[var(--ro-text-muted)]">{meta}</div></div><StatusBadge status={(type === "taskStatus" ? taskStatus : maintenanceStatus)[key]} size="sm" /></div>)}
              </div>
            </section>
             <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)]">
               <div className="flex items-center justify-between border-b border-[var(--ro-border)] px-4 py-3"><h2 className="text-base font-bold">آخر النشاط على المركبات</h2><a href="#" className="text-sm font-semibold text-[var(--ro-primary)]">السجل الكامل</a></div>
               <div className="divide-y divide-[var(--ro-border)]">{[[`تم تسجيل دفعة بقيمة ${formatCurrency(180)}`,"هبة العتيبي · منذ 8 دقائق","success"],["تم إرجاع Hyundai Elantra","فادي نصر · منذ 23 دقيقة","info"],["تم إنشاء إيجار جديد للعميل رامي قاسم","هبة العتيبي · منذ ساعة","neutral"]].map(([title, meta, tone]) => <div key={title} className="flex gap-3 px-4 py-3"><div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tone === "success" ? "bg-[var(--ro-success)]" : tone === "info" ? "bg-[var(--ro-info)]" : "bg-[var(--ro-neutral)]"}`} /><div><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-xs text-[var(--ro-text-faint)]">{meta}</div></div></div>)}</div>
            </section>
          </div>
        </div>
      </main>
    </AppFrame>
  );
}