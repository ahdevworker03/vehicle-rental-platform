import { useState } from "react";
import { BarChart3, CalendarDays, ChevronDown, Download, FileWarning, Filter, LineChart, RefreshCw, TrendingUp, WalletCards, X } from "lucide-react";
import { AppFrame } from "./_shared/AppFrame";
import { PageHeader, PrimaryButton, SecondaryButton } from "./_shared/PageHeader";
import { KPICard } from "./_shared/KPICard";
import { StatusBadge } from "./_shared/StatusBadge";
import { paymentStatus } from "./_shared/statusConfig";
import { arabicMonths, formatCurrency, formatPlate } from "./_shared/format";

const months = [...arabicMonths.slice(0, 6)];
const revenue = [14800, 16150, 15420, 18740, 20180, 21630];
const maintenance = [1820, 2240, 1960, 2710, 2340, 2890];
const rentals = [74, 82, 79, 96, 108, 116];

function TrendChart({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const width = 620;
  const margin = 46;
  const points = values.map((value, index) => {
    const x = margin + (index * (width - margin * 2)) / (values.length - 1);
    const y = 38 + ((max - value) / Math.max(max - min, 1)) * 92;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 620 178" className="h-[198px] w-full" role="img" aria-label="رسم بياني للقيم الشهرية">
        {[38, 68, 98, 128].map((y) => <line key={y} x1={margin} x2={width - margin} y1={y} y2={y} stroke="var(--ro-border)" strokeDasharray="3 4" />)}
        <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((value, index) => {
          const [x, y] = points.split(" ")[index].split(",");
          return <g key={months[index]}><circle cx={x} cy={y} r="4.5" fill="var(--ro-surface)" stroke={color} strokeWidth="3" /><text x={x} y={Math.max(Number(y) - 20, 12)} textAnchor="middle" direction="ltr" fontSize="10" fontWeight="600" fill="var(--ro-text)">{formatCurrency(value)}</text><text x={x} y="168" textAnchor="middle" fontSize="11" fill="var(--ro-text-muted)">{months[index]}</text></g>;
        })}
      </svg>
      <div className="flex items-center justify-between border-t border-[var(--ro-border)] pt-3 text-xs text-[var(--ro-text-muted)]">
        <span>الأدنى: <strong className="text-[var(--ro-text)]">{formatCurrency(min)}</strong></span>
        <span>الأعلى: <strong className="text-[var(--ro-text)]">{formatCurrency(max)}</strong></span>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof BarChart3; title: string }) {
  return <div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--ro-primary-soft)] text-[var(--ro-primary)]"><Icon className="h-4 w-4" /></div><h3 className="text-base font-bold">{title}</h3></div>;
}

export function AnalyticsDesktop() {
  const [period, setPeriod] = useState("شهر");
  const [tableMode, setTableMode] = useState(false);
  const [notice, setNotice] = useState("");
  const apply = () => setNotice(`تم تحديث النتائج للفترة: ${period}`);
  return (
    <AppFrame variant="desktop" active="analytics">
      <PageHeader title="التحليلات والتقارير" description="راجع الإيرادات، المصاريف، الأرباح، وأداء المركبات خلال الفترة المحددة." primaryAction={<PrimaryButton><Download className="h-4 w-4" />تصدير التقرير</PrimaryButton>} secondary={<SecondaryButton><RefreshCw className="h-4 w-4" />تحديث البيانات</SecondaryButton>} />
      <main className="space-y-5 p-5 xl:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ro-border)] pb-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--ro-text-muted)]"><CalendarDays className="h-4 w-4 text-[var(--ro-primary)]" /><span>الفترة الزمنية</span><div className="relative"><select aria-label="اختيار الفترة الزمنية" value={period} onChange={(e) => setPeriod(e.target.value)} className="h-10 appearance-none rounded-lg border border-[var(--ro-border)] bg-[var(--ro-surface)] py-0 pe-9 ps-3 font-semibold text-[var(--ro-text)] outline-none focus:border-[var(--ro-primary)]"><option>أسبوع</option><option>شهر</option><option>ربع سنة</option><option>مخصص</option></select><ChevronDown className="pointer-events-none absolute inset-y-0 end-3 my-auto h-4 w-4 text-[var(--ro-text-faint)]" /></div><button onClick={apply} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--ro-border)] px-4 text-sm font-semibold hover:bg-[var(--ro-bg)]"><Filter className="h-4 w-4" />تطبيق التصفية</button></div>
          <div className="text-sm text-[var(--ro-text-faint)]">آخر مزامنة: اليوم — 9:42 AM</div>
        </div>
        {notice && <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-[var(--ro-info-border)] bg-[var(--ro-info-bg)] px-4 py-3 text-sm font-semibold text-[var(--ro-info)]"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="إغلاق الإشعار" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--ro-info)] hover:bg-[var(--ro-info)]/10"><X className="h-4 w-4" /></button></div>}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KPICard label="إجمالي الإيرادات" period="هذا الشهر" value={formatCurrency(106920)} changePct="7.2%" icon={WalletCards} />
          <KPICard label="الأرصدة المستحقة" period="حتى 30 حزيران" value={formatCurrency(8765)} changePct="11.4%" changeIsGood={false} icon={FileWarning} />
          <KPICard label="صافي الربح" period="الفترة المحددة" value={formatCurrency(65130)} changePct="9.8%" icon={TrendingUp} />
          <KPICard label="معدل استخدام المركبات" period="هذا الشهر" value="74.6%" changePct="3.1%" icon={BarChart3} />
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)] p-5"><SectionTitle icon={LineChart} title="إيرادات الفترة المحددة" /><TrendChart values={revenue} color="var(--ro-primary)" /><div className="mt-4 overflow-x-auto rounded-lg border border-[var(--ro-border)]"><table className="w-full min-w-[620px] text-right text-sm"><thead className="bg-[var(--ro-bg)] text-[var(--ro-text-muted)]"><tr><th className="px-3 py-2 font-semibold">الشهر</th>{months.map((m) => <th key={m} className="px-2 py-2 font-semibold">{m}</th>)}</tr></thead><tbody><tr><td className="px-3 py-2 font-semibold text-xs">الإيرادات</td>{revenue.map((v) => <td key={v} className="px-2 py-2 tabular-nums text-xs">{formatCurrency(v)}</td>)}</tr></tbody></table></div></section>
          <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)] p-5"><SectionTitle icon={WalletCards} title="العملاء الذين لديهم أرصدة مستحقة" /><div className="divide-y divide-[var(--ro-border)]">{[["شركة مدار اللوجستية", 2840, "45 يومًا", "unpaid"], ["عبدالله الحربي", 1785, "18 يومًا", "partial"], ["مؤسسة أبعاد", 1260, "11 يومًا", "partial"], ["سارة القحطاني", 890, "5 أيام", "partial"]].map(([name, amount, days, status]) => <div key={String(name)} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{name}</div><div className="mt-1 text-xs text-[var(--ro-text-faint)]">متأخر {days}</div><span className="mt-1.5 block whitespace-nowrap text-sm font-bold tabular-nums">{formatCurrency(Number(amount))}</span></div><StatusBadge status={paymentStatus[String(status)]} size="sm" /></div>)}</div><div className="mt-3 flex items-center justify-between border-t border-[var(--ro-border)] pt-4"><span className="text-sm font-semibold text-[var(--ro-text-muted)]">إجمالي الأرصدة المستحقة</span><span className="text-lg font-bold tabular-nums">{formatCurrency(8765)}</span></div></section>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)] p-5"><SectionTitle icon={TrendingUp} title="أكثر المركبات ربحاً" /><div className="space-y-4">{[["Toyota Camry 2023", formatPlate("B", "245781"), 4280, 92], ["Kia Sportage 2022", formatPlate("G", "903112"), 3745, 80], ["Hyundai Elantra 2024", formatPlate("D", "617430"), 3210, 68], ["Toyota Yaris 2022", formatPlate("R", "482605"), 2670, 55]].map(([name, plate, amount, width], i) => <div key={String(plate)}><div className="mb-1.5 flex items-center gap-2 text-sm"><span className="w-5 text-[var(--ro-text-faint)]">{i + 1}</span><span className="flex flex-1 items-baseline gap-2 overflow-hidden"><span className="truncate font-semibold">{name}</span><span className="shrink-0 text-xs font-normal text-[var(--ro-text-faint)]">{plate}</span></span><b className="whitespace-nowrap">{formatCurrency(Number(amount))}</b></div><div className="h-2 rounded-full bg-[var(--ro-bg)]"><div className="h-2 rounded-full bg-[var(--ro-primary)]" style={{ width: `${width}%` }} /></div></div>)}</div></section>
          <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)] p-5"><SectionTitle icon={BarChart3} title="تكاليف الصيانة" /><TrendChart values={maintenance} color="var(--ro-warning)" /><div className="mt-3 flex items-center justify-between border-t border-[var(--ro-border)] pt-3 text-sm text-[var(--ro-text-muted)]"><span>إجمالي تكاليف الصيانة</span><strong className="text-[var(--ro-text)]">{formatCurrency(13960)}</strong></div></section>
        </div>
        <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)] p-5"><div className="mb-4 flex items-center justify-between"><SectionTitle icon={BarChart3} title="اتجاهات الإيجارات" /><button onClick={() => setTableMode(!tableMode)} className="h-9 rounded-md border border-[var(--ro-border)] px-4 text-sm font-semibold hover:bg-[var(--ro-bg)]">{tableMode ? "عرض الرسم" : "عرض الجدول"}</button></div>{tableMode ? <table className="w-full text-right text-sm"><thead className="bg-[var(--ro-bg)]"><tr><th className="px-3 py-2">المؤشر</th>{months.map((m) => <th key={m} className="px-3 py-2">{m}</th>)}</tr></thead><tbody><tr className="border-t border-[var(--ro-border)]"><td className="px-3 py-2 font-semibold">عدد الإيجارات</td>{rentals.map((v) => <td key={v} className="px-3 py-2 tabular-nums">{v}</td>)}</tr></tbody></table> : <div className="grid grid-cols-3 items-end gap-4 px-3 pb-1 pt-2 sm:grid-cols-6">{rentals.map((v, i) => <div key={months[i]} className="text-center"><div className="mb-2 text-sm font-bold">{v} إيجار</div><div className="mx-auto h-24 w-9 rounded-t-md bg-[var(--ro-primary-soft)]"><div className="h-full rounded-t-md bg-[var(--ro-primary)]" style={{ transform: `scaleY(${v / 125})`, transformOrigin: "bottom" }} /></div><div className="mt-2 text-xs text-[var(--ro-text-muted)]">{months[i]}</div></div>)}</div>}</section>
      </main>
    </AppFrame>
  );
}