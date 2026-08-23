import { useState } from "react";
import { ArrowRight, CalendarDays, CarFront, Check, CircleDollarSign, Clock3, FileDown, MapPin, MessageSquareText, ReceiptText, UserRound, XCircle } from "lucide-react";
import { AppFrame } from "./_shared/AppFrame";
import { PageHeader, SecondaryButton } from "./_shared/PageHeader";
import { StatusBadge } from "./_shared/StatusBadge";
import { rentalStatus, paymentStatus, vehicleStatus } from "./_shared/statusConfig";
import { formatCurrency, formatDateCompact, formatDateTime, formatPlate } from "./_shared/format";
import { Ltr } from "./_shared/Ltr";
const money = (n: number) => formatCurrency(n);
function Section({ title, icon: Icon, children }: { title: string; icon: typeof UserRound; children: React.ReactNode }) { return <section className="rounded-lg border border-[var(--ro-border)] bg-[var(--ro-surface)]"><div className="flex items-center gap-2 border-b border-[var(--ro-border)] px-4 py-3 text-base font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--ro-primary-soft)] text-[var(--ro-primary)]"><Icon className="h-4 w-4" /></span>{title}</div><div className="p-4">{children}</div></section>; }
function Item({ label, value, wrap }: { label: string; value: import("react").ReactNode; wrap?: boolean }) { return <div className="min-w-0"><div className="text-xs text-[var(--ro-text-faint)]">{label}</div><div className={`mt-1 text-sm font-semibold ${wrap ? "break-words" : "truncate"}`}>{value}</div></div>; }
const actions = ["تمديد الإيجار", "إرجاع المركبة", "طباعة / تصدير العقد", "إلغاء العقد"];
const actionIcons = [CalendarDays, CarFront, FileDown, XCircle];
export function RentalDetailTablet() {
  const [notice, setNotice] = useState(""); const [showPayment, setShowPayment] = useState(false); const action = (label: string) => setNotice(`${label} — تم تجهيز الإجراء للمراجعة`);
  return (
    <AppFrame variant="tablet" active="rentals">
      <PageHeader
        title="تفاصيل الإيجار"
        description="عقد رقم 240318"
        secondary={<div className="flex items-center gap-1.5 text-sm"><span className="text-[var(--ro-text-muted)]">حالة الإيجار:</span><StatusBadge status={rentalStatus.active} /></div>}
        primaryAction={<SecondaryButton><ArrowRight className="h-4 w-4" /> العودة</SecondaryButton>}
      />
      <main className="p-4">
        {notice && <div className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--ro-success-border)] bg-[var(--ro-success-bg)] px-3 py-3 text-sm font-semibold text-[var(--ro-success)]"><Check className="h-4 w-4" />{notice}</div>}
        <div className="mb-4 rounded-lg border border-[var(--ro-border)] bg-[var(--ro-surface)] px-4 py-4">
          <h2 className="text-lg font-bold">محمد بن عبدالله العتيبي</h2>
          <p className="mt-1 text-sm text-[var(--ro-text-muted)]">Toyota Camry 2023 · {formatPlate("B", "482104")}</p>
        </div>
        <div className="grid grid-cols-[260px_minmax(0,1fr)] items-start gap-4">
          <aside className="sticky top-4 space-y-3">
            <section className="overflow-hidden rounded-lg border border-[var(--ro-border)] bg-[var(--ro-surface)]">
              <div className="flex items-center justify-between bg-[var(--ro-primary-dark)] px-4 py-3 text-white"><span className="text-sm text-white/70">حالة الإيجار</span><StatusBadge status={rentalStatus.active} size="sm" /></div>
              <div className="space-y-2 p-4 text-sm">
                <button onClick={() => setShowPayment(!showPayment)} className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--ro-primary)] text-sm font-bold text-white"><CircleDollarSign className="h-4 w-4" />تسجيل دفعة</button>
                {showPayment && <button onClick={() => { setShowPayment(false); action("تم تسجيل الدفعة"); }} className="h-9 w-full rounded bg-[var(--ro-primary-soft)] text-sm font-bold text-[var(--ro-primary)]">حفظ الدفعة</button>}
                {actions.map((label, i) => { const Icon = actionIcons[i]; const isDanger = i === actions.length - 1; return <button key={label} onClick={() => action(label)} className={`flex h-10 w-full items-center justify-center gap-2 rounded-md border text-sm font-bold ${isDanger ? "border-[var(--ro-danger-border)] text-[var(--ro-danger)]" : "border-[var(--ro-border)]"}`}><Icon className="h-4 w-4" />{label}</button>; })}
              </div>
            </section>
          </aside>
          <div className="space-y-3">
            <Section title="فترة الإيجار" icon={CalendarDays}>
              <div className="grid grid-cols-2 gap-4">
                {[["الاستلام", formatDateTime(18, 8, 2024, 9, 30)], ["الإرجاع", formatDateTime(21, 8, 2024, 9, 30)]].map(([label, date]) => (
                  <div key={label} className="min-w-0 rounded-md bg-[var(--ro-bg)] p-3">
                    <div className="flex items-center gap-1 text-sm font-bold text-[var(--ro-text-muted)]"><Clock3 className="h-4 w-4 shrink-0 text-[var(--ro-primary)]" />{label}</div>
                    <Ltr className="mt-2 block truncate text-sm font-bold">{date}</Ltr>
                    <span className="mt-2 flex items-center gap-1 truncate text-xs text-[var(--ro-text-muted)]"><MapPin className="h-3.5 w-3.5 shrink-0" />فرع العليا، الرياض</span>
                  </div>
                ))}
              </div>
            </Section>
            <div className="grid grid-cols-2 gap-3">
              <Section title="بيانات العميل" icon={UserRound}><div className="grid grid-cols-2 gap-x-4 gap-y-5"><Item wrap label="الاسم الكامل" value="محمد بن عبدالله العتيبي" /><Item label="رقم الجوال" value={<Ltr>050 842 1963</Ltr>} /><Item label="رقم الهوية" value={<Ltr>1024689317</Ltr>} /><Item wrap label="معلومات الرخصة" value={<span>سارية حتى <Ltr>22-09-2025</Ltr></span>} /></div></Section>
              <Section title="المركبة" icon={CarFront}><div className="grid grid-cols-2 gap-x-4 gap-y-5"><Item wrap label="المركبة" value="Toyota Camry 2023" /><Item label="رقم اللوحة" value={formatPlate("B", "482104")} /><Item label="اللون" value="أبيض لؤلؤي" /><div><div className="mb-1 text-xs text-[var(--ro-text-faint)]">حالة المركبة</div><StatusBadge status={vehicleStatus.rented} size="sm" /></div></div></Section>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Section title="التسعير والمدفوعات" icon={CircleDollarSign}><div className="space-y-3 text-sm"><Item label="إجمالي المبلغ" value={money(855)} /><Item label="المدفوع" value={money(500)} /><Item label="المتبقي" value={money(355)} /><div className="flex items-center justify-between border-t border-[var(--ro-border)] pt-3"><span className="text-[var(--ro-text-muted)]">حالة الدفع</span><StatusBadge status={paymentStatus.partial} size="sm" /></div></div></Section>
              <Section title="سجل الدفعات" icon={ReceiptText}><div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-2 border-b border-[var(--ro-border)] pb-2 text-xs font-semibold text-[var(--ro-text-faint)]"><span>التاريخ</span><span>الطريقة</span><span className="text-left">المبلغ</span></div>
                {[[18, "نقدًا", 300], [18, "تحويل بنكي", 200]].map(([day, method, amount]) => (
                  <div key={String(method)} className="grid grid-cols-3 items-center gap-2 border-b border-[var(--ro-border)] py-2 last:border-b-0"><Ltr className="text-xs">{formatDateCompact(Number(day), 8, 2024)}</Ltr><span className="truncate text-xs">{method}</span><b className="text-left tabular-nums">{money(Number(amount))}</b></div>
                ))}
              </div></Section>
            </div>
            <Section title="سجل النشاط" icon={MessageSquareText}><div className="grid grid-cols-2 gap-4 text-sm"><div><Ltr className="text-xs text-[var(--ro-text-faint)]">18-08-2024 — 9:30 AM</Ltr><b className="block">تم إنشاء العقد</b></div><div><Ltr className="text-xs text-[var(--ro-text-faint)]">18-08-2024 — 10 AM</Ltr><b className="block">تم تسليم المركبة</b></div></div></Section>
          </div>
        </div>
      </main>
    </AppFrame>
  );
}