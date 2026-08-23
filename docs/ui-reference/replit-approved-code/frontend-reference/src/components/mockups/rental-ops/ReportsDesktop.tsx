import { useState } from "react";
import { CalendarDays, Car, Download, FileBarChart2, Filter, Printer, RefreshCw, WalletCards } from "lucide-react";
import { AppFrame } from "./_shared/AppFrame";
import { KPICard } from "./_shared/KPICard";
import { PageHeader } from "./_shared/PageHeader";
import { StatusBadge } from "./_shared/StatusBadge";
import { paymentStatus } from "./_shared/statusConfig";
import { formatCurrency, formatDateCompact } from "./_shared/format";

const periods = ["أسبوع", "شهر", "ربع سنة", "مخصص"];
const rows = [
  ["RN-2481", "شركة مدار اللوجستية", "Toyota Camry 2023", [28, 6, 2024], 1280, "paid"],
  ["RN-2478", "عبدالله الحربي", "Kia Sportage 2022", [27, 6, 2024], 845, "partial"],
  ["RN-2472", "سارة القحطاني", "Hyundai Elantra 2024", [26, 6, 2024], 690, "paid"],
  ["RN-2466", "مؤسسة أبعاد", "Toyota Yaris 2022", [25, 6, 2024], 540, "unpaid"],
  ["RN-2459", "خالد العتيبي", "Nissan X-Trail 2023", [23, 6, 2024], 1150, "paid"],
  ["RN-2451", "نورة السالم", "Mazda CX-5 2024", [21, 6, 2024], 920, "partial"],
] as const;

export function ReportsDesktop() {
  const [period, setPeriod] = useState("شهر");
  const [reportType, setReportType] = useState("تقرير الإيرادات");
  const [notice, setNotice] = useState("");
  const [vehicleType, setVehicleType] = useState("كل الأنواع");
  const notify = (message: string) => setNotice(message);
  return (
    <AppFrame variant="desktop" active="reports">
      <PageHeader title="تقارير الإيجارات" description="راجع بيانات الإيجارات والمدفوعات خلال الفترة المحددة." primaryAction={<button onClick={() => notify("جارٍ تجهيز ملف PDF")} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--ro-primary)] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[var(--ro-primary)]/90"><Download className="h-4 w-4" />تصدير PDF</button>} secondary={<div className="flex items-center gap-2"><button onClick={() => notify("تم إرسال التقرير إلى الطباعة")} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ro-border)] bg-[var(--ro-surface)] px-4 text-sm font-semibold text-[var(--ro-text)] hover:bg-[var(--ro-bg)]"><Printer className="h-4 w-4" />طباعة</button></div>} />
      <main className="space-y-5 p-5 xl:p-6">
        <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)] p-5"><div className="flex flex-wrap items-end gap-4">
          <label className="min-w-[220px] flex-1 text-sm font-semibold text-[var(--ro-text-muted)]">نوع التقرير<select value={reportType} onChange={(e) => setReportType(e.target.value)} className="mt-2 h-10 w-full rounded-lg border border-[var(--ro-border)] bg-[var(--ro-bg)] px-3 pr-9 text-sm font-bold text-[var(--ro-text)] outline-none focus:border-[var(--ro-primary)]"><option>تقرير الإيرادات</option><option>تقرير الإيجارات</option><option>تقرير المدفوعات المستحقة</option><option>تقرير حالة الأسطول</option></select></label>
          <label className="min-w-[150px] text-sm font-semibold text-[var(--ro-text-muted)]"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[var(--ro-primary)]" />الفترة</span><select value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-2 h-10 w-full rounded-lg border border-[var(--ro-border)] bg-[var(--ro-bg)] px-3 pr-9 text-sm font-bold text-[var(--ro-text)] outline-none focus:border-[var(--ro-primary)] pl-[11px]">{periods.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="min-w-[150px] text-sm font-semibold text-[var(--ro-text-muted)]">نوع المركبة<select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="mt-2 h-10 w-full rounded-lg border border-[var(--ro-border)] bg-[var(--ro-bg)] px-3 pr-9 text-sm text-[var(--ro-text)] outline-none focus:border-[var(--ro-primary)]"><option>كل الأنواع</option><option>سيدان</option><option>دفع رباعي</option><option>اقتصادية</option></select></label>
          <button onClick={() => notify(`تم تحديث ${reportType} للفترة: ${period}`)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--ro-primary-soft)] px-4 text-sm font-bold text-[var(--ro-primary)] hover:bg-[var(--ro-primary-soft)]/70"><Filter className="h-4 w-4" />تطبيق التصفية</button>
        </div></section>
        {notice && <div role="status" className="rounded-lg border border-[var(--ro-info-border)] bg-[var(--ro-info-bg)] px-4 py-3 text-sm font-semibold text-[var(--ro-info)]">{notice}</div>}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"><KPICard label="إجمالي الإيرادات" period="هذا الشهر" value={formatCurrency(18420)} changePct="8.6%" icon={WalletCards} /><KPICard label="عدد الإيجارات" period="الفترة المحددة" value="116" changePct="12.3%" icon={FileBarChart2} /><KPICard label="متوسط قيمة الإيجار" period="لكل عقد" value={formatCurrency(158)} changePct="4.1%" icon={Car} /><KPICard label="معدل التحصيل" period="هذا الشهر" value="87.4%" changePct="2.8%" icon={RefreshCw} /></div>
        <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)] p-5"><div className="mb-4 flex items-center justify-between border-b border-[var(--ro-border)] pb-4"><div><h3 className="text-base font-bold">{reportType}</h3><p className="mt-1 text-sm text-[var(--ro-text-faint)]">{period} · آخر تحديث: اليوم — 9:42 AM</p></div><span className="text-sm text-[var(--ro-text-muted)]">6 سجلات معروضة</span></div>
          <div className="overflow-x-auto rounded-lg border border-[var(--ro-border)]"><table className="w-full min-w-[760px] text-right text-sm"><thead className="bg-[var(--ro-bg)] text-[var(--ro-text-muted)]"><tr><th className="px-3 py-3 font-semibold">رقم الإيجار</th><th className="px-3 py-3 font-semibold">العميل</th><th className="px-3 py-3 font-semibold">المركبة</th><th className="px-3 py-3 font-semibold">التاريخ</th><th className="px-3 py-3 font-semibold">المبلغ</th><th className="px-3 py-3 font-semibold">الحالة</th></tr></thead><tbody>{rows.map(([ref, customer, vehicle, date, amount, status]) => <tr key={ref} className="border-t border-[var(--ro-border)] hover:bg-[var(--ro-bg)]"><td className="px-3 py-3 font-bold text-[var(--ro-primary)]" dir="ltr">#{ref}</td><td className="px-3 py-3 font-semibold">{customer}</td><td className="px-3 py-3 text-[var(--ro-text-muted)]" dir="ltr">{vehicle}</td><td className="px-3 py-3 tabular-nums text-[var(--ro-text-muted)]" dir="ltr">{formatDateCompact(date[0], date[1], date[2])}</td><td className="whitespace-nowrap px-3 py-3 font-bold tabular-nums">{formatCurrency(amount)}</td><td className="px-3 py-3"><StatusBadge status={paymentStatus[status]} size="sm" /></td></tr>)}</tbody></table></div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--ro-bg)] px-4 py-3 text-sm"><span className="font-semibold text-[var(--ro-text-muted)]">إجمالي الإيجارات المعروضة</span><strong className="text-base tabular-nums">{formatCurrency(5425)}</strong></div>
        </section>
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]"><div className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)] p-5"><div className="mb-3 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--ro-primary-soft)] text-[var(--ro-primary)]"><FileBarChart2 className="h-4 w-4" /></div><h3 className="text-base font-bold">ملاحظات التقرير</h3></div><div className="space-y-2 text-sm text-[var(--ro-text-muted)]"><p className="rounded-lg bg-[var(--ro-bg)] px-3 py-2">3 عقود تحتاج إلى متابعة مستندات التسليم.</p><p className="rounded-lg bg-[var(--ro-bg)] px-3 py-2">توجد 42 دفعة جزئية أو غير مسددة.</p></div></div><div className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)] p-5"><h3 className="mb-4 text-base font-bold">حالة السجلات</h3><div className="space-y-3 text-sm"><div className="flex items-center justify-between"><span>مدفوع بالكامل</span><strong>74</strong></div><div className="h-2 rounded-full bg-[var(--ro-bg)]"><div className="h-2 w-[64%] rounded-full bg-[var(--ro-success)]" /></div><div className="flex items-center justify-between"><span>دفعة جزئية أو غير مدفوع</span><strong>42</strong></div><div className="h-2 rounded-full bg-[var(--ro-bg)]"><div className="h-2 w-[36%] rounded-full bg-[var(--ro-warning)]" /></div></div></div></section>
      </main>
    </AppFrame>
  );
}