import { useState } from "react";
import {
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  MapPin,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { vehicleStatus } from "./statusConfig";
import { formatDateCompact } from "./format";

/** "18-08-2024 — 10:00 AM" — date-picker fields always show two-digit minutes. */
function formatPickerDateTime(
  day: number,
  month1to12: number,
  year: number,
  hour24: number,
  minute = 0,
): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return `${formatDateCompact(day, month1to12, year)} — ${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function RentalFormContent({ mobile = false }: { mobile?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [customer, setCustomer] = useState("سارة محمد الغامدي");
  const [vehicle, setVehicle] = useState("Toyota Camry 2023 — B 482104");
  const field =
    "mt-1.5 flex h-11 w-full items-center rounded-lg border border-[var(--ro-border)] bg-[var(--ro-surface)] px-3 text-sm text-[var(--ro-text)] outline-none transition focus-within:border-[var(--ro-primary)] focus-within:ring-2 focus-within:ring-[var(--ro-primary)]/15";
  const label = "text-xs font-semibold text-[var(--ro-text-muted)]";
  return (
    <div
      className={`mx-auto max-w-[1120px] ${mobile ? "px-4 pb-24" : "px-6 pb-8"}`}
    >
      <div className="pt-5">
        <h1 className="text-xl font-bold text-[var(--ro-text)] sm:text-2xl">
          إنشاء إيجار جديد
        </h1>
        <p className="mt-1.5 text-sm text-[var(--ro-text-muted)]">
          أدخل بيانات الإيجار الأساسية.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)]">
          <div className="flex items-center gap-3 border-b border-[var(--ro-border)] px-4 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--ro-primary-soft)] text-[var(--ro-primary)]">
              <UserRound className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold sm:text-base">العميل</h2>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-end">
            <label htmlFor="customer" className="block">
              <span className={label}>ابحث بالاسم أو رقم الجوال</span>
              <div className={field}>
                <Search className="ms-2 h-4 w-4 shrink-0 text-[var(--ro-text-faint)]" />
                <input
                  id="customer"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </label>
            <button
              type="button"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--ro-primary)] px-4 text-sm font-bold text-[var(--ro-primary)] hover:bg-[var(--ro-primary-soft)]"
            >
              <Plus className="h-4 w-4" />
              إضافة عميل جديد
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)]">
          <div className="flex items-center gap-3 border-b border-[var(--ro-border)] px-4 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--ro-primary-soft)] text-[var(--ro-primary)]">
              <Car className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold sm:text-base">المركبة</h2>
          </div>
          <div className="p-4">
            <label htmlFor="vehicle" className="block">
              <span className={label}>اختر المركبة</span>
              <div className={field}>
                <Car className="me-2 h-4 w-4 shrink-0 text-[var(--ro-text-faint)]" />
                <select
                  id="vehicle"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="min-w-0 flex-1 appearance-none bg-transparent text-sm outline-none"
                >
                  <option>Toyota Camry 2023 — B 482104</option>
                  <option>Hyundai Elantra 2022 — B 317045</option>
                </select>
                <ChevronDown className="ms-2 h-4 w-4 shrink-0 text-[var(--ro-text-faint)]" />
              </div>
            </label>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[var(--ro-success)]">
              <Check className="h-4 w-4 shrink-0" />
              <span>متاحة للفترة المحددة</span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)]">
          <div className="flex items-center gap-3 border-b border-[var(--ro-border)] px-4 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--ro-primary-soft)] text-[var(--ro-primary)]">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold sm:text-base">فترة الإيجار</h2>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-2">
            <label htmlFor="pickup-date" className="block">
              <span className={label}>الاستلام</span>
              <div className={field}>
                <CalendarDays className="me-2 h-4 w-4 shrink-0 text-[var(--ro-primary)]" />
                <span className="tabular-nums">
                  {formatPickerDateTime(18, 8, 2024, 10)}
                </span>
              </div>
            </label>
            <label htmlFor="return-date" className="block">
              <span className={label}>الإرجاع</span>
              <div className={field}>
                <CalendarDays className="me-2 h-4 w-4 shrink-0 text-[var(--ro-primary)]" />
                <span className="tabular-nums">
                  {formatPickerDateTime(23, 8, 2024, 10)}
                </span>
              </div>
            </label>
            <label htmlFor="pickup-location" className="block">
              <span className={label}>موقع الاستلام</span>
              <div className={field}>
                <MapPin className="ms-2 h-4 w-4 shrink-0 text-[var(--ro-text-faint)]" />
                <select
                  id="pickup-location"
                  className="w-full appearance-none bg-transparent text-sm outline-none"
                >
                  <option>فرع الحمرا — بيروت</option>
                  <option>مطار رفيق الحريري</option>
                </select>
                <ChevronDown className="h-4 w-4 shrink-0 text-[var(--ro-text-faint)]" />
              </div>
            </label>
            <label htmlFor="return-location" className="block">
              <span className={label}>موقع الإرجاع</span>
              <div className={field}>
                <MapPin className="ms-2 h-4 w-4 shrink-0 text-[var(--ro-text-faint)]" />
                <select
                  id="return-location"
                  className="w-full appearance-none bg-transparent text-sm outline-none"
                >
                  <option>فرع الحمرا — بيروت</option>
                  <option>مطار رفيق الحريري</option>
                </select>
                <ChevronDown className="h-4 w-4 shrink-0 text-[var(--ro-text-faint)]" />
              </div>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)]">
          <div className="flex items-center gap-3 border-b border-[var(--ro-border)] px-4 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--ro-primary-soft)] text-[var(--ro-primary)]">
              <span className="text-xs font-bold">USD</span>
            </div>
            <h2 className="text-sm font-bold sm:text-base">التسعير والتأمين</h2>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label htmlFor="daily-rate" className="block">
              <span className={label}>السعر اليومي (USD)</span>
              <input
                id="daily-rate"
                defaultValue="45"
                className={`${field} tabular-nums`}
              />
            </label>
            <label htmlFor="total-days" className="block">
              <span className={label}>إجمالي أيام الإيجار</span>
              <input
                id="total-days"
                defaultValue="5"
                className={`${field} tabular-nums`}
              />
            </label>
            <label htmlFor="total" className="block">
              <span className={label}>الإجمالي المستحق (USD)</span>
              <input
                id="total"
                defaultValue="225"
                readOnly
                className={`${field} tabular-nums`}
              />
            </label>
            <label htmlFor="deposit" className="block">
              <span className={label}>مبلغ التأمين (USD)</span>
              <input
                id="deposit"
                defaultValue="200"
                className={`${field} tabular-nums`}
              />
            </label>
          </div>
          <div className="border-t border-[var(--ro-border)] px-4 py-3">
            <p className="text-xs text-[var(--ro-text-faint)]">
              هذا الملخص لأغراض العقد فقط — لا يتم تحصيل أي دفعة إلكترونية من
              هذه الصفحة.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--ro-border)] bg-[var(--ro-surface)]">
          <div className="border-b border-[var(--ro-border)] px-4 py-4">
            <h2 className="text-sm font-bold sm:text-base">ملاحظات</h2>
          </div>
          <div className="p-4">
            <label htmlFor="notes" className="block">
              <span className={label}>ملاحظات العقد (اختياري)</span>
              <textarea
                id="notes"
                rows={mobile ? 3 : 2}
                placeholder="أضف أي ملاحظات مهمة للموظف أو العميل..."
                className="mt-1.5 w-full resize-none rounded-lg border border-[var(--ro-border)] bg-[var(--ro-surface)] p-3 text-sm outline-none placeholder:text-[var(--ro-text-faint)] focus:border-[var(--ro-primary)] focus:ring-2 focus:ring-[var(--ro-primary)]/15"
              />
            </label>
          </div>
        </section>
      </div>

      <div
        className={`${mobile ? "fixed inset-x-0 bottom-[61px] z-20" : "sticky bottom-0 mt-5"} border-t border-[var(--ro-border)] bg-[var(--ro-surface)]/95 p-3 backdrop-blur-sm`}
      >
        <div className="mx-auto flex max-w-[1120px] items-center justify-end gap-2">
          <button
            type="button"
            className="h-11 rounded-lg border border-[var(--ro-border)] px-5 text-sm font-semibold text-[var(--ro-text)] hover:bg-[var(--ro-bg)]"
            onClick={() => setSaved(false)}
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ro-primary)] px-6 text-sm font-bold text-white hover:bg-[var(--ro-primary-dark)]"
          >
            {saved && <Check className="h-4 w-4" />}
            {saved ? "تم حفظ المسودة" : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}
