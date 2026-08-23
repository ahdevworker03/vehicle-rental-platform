import { ArrowLeft, CalendarDays, CarFront } from "lucide-react";
import { paymentStatus, rentalStatus, returnUrgency } from "./statusConfig";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatDateCompact, formatPlate } from "./format";

export type Rental = {
  id: string;
  customer: string;
  phone: string;
  area: string;
  vehicle: string;
  plate: string;
  status: keyof typeof rentalStatus;
  pickup: string;
  returnDate: string;
  urgency: keyof typeof returnUrgency;
  total: string;
  balance: string;
  payment: keyof typeof paymentStatus;
  action: string;
};

// All amounts, dates, and plates below already use the locked global formats:
// Western numerals, USD suffix, Day-Month-Year, English vehicle names & plates.
export const rentals: Rental[] = [
  { id: "R-2418", customer: "عبدالله الغامدي", phone: "050 842 1930", area: "طرابلس — الميناء", vehicle: "Toyota Camry 2023", plate: formatPlate("B", "482104"), status: "overdue", pickup: formatDateCompact(12, 5, 2024), returnDate: formatDateCompact(15, 5, 2024), urgency: "overdue", total: formatCurrency(385), balance: formatCurrency(128), payment: "partial", action: "إرجاع المركبة" },
  { id: "R-2417", customer: "نورة السالم", phone: "055 310 6274", area: "بيروت — الحمرا", vehicle: "Hyundai Tucson 2024", plate: formatPlate("N", "930215"), status: "active", pickup: formatDateCompact(14, 5, 2024), returnDate: formatDateCompact(18, 5, 2024), urgency: "today", total: formatCurrency(500), balance: formatCurrency(0), payment: "paid", action: "تمديد الإيجار" },
  { id: "R-2416", customer: "شركة مدار للمقاولات", phone: "011 284 6612", area: "زحلة — البقاع", vehicle: "Toyota Hilux 2022", plate: formatPlate("G", "774031"), status: "reserved", pickup: formatDateCompact(17, 5, 2024), returnDate: formatDateCompact(22, 5, 2024), urgency: "soon", total: formatCurrency(560), balance: formatCurrency(560), payment: "unpaid", action: "تأكيد التسليم" },
  { id: "R-2415", customer: "سلمان الحربي", phone: "053 774 2081", area: "صيدا — وسط المدينة", vehicle: "Kia K5 2023", plate: formatPlate("S", "118542"), status: "active", pickup: formatDateCompact(13, 5, 2024), returnDate: formatDateCompact(20, 5, 2024), urgency: "normal", total: formatCurrency(710), balance: formatCurrency(175), payment: "partial", action: "تمديد الإيجار" },
  { id: "R-2414", customer: "ريم العتيبي", phone: "056 101 4938", area: "جونية — الساحل", vehicle: "Nissan X-Trail 2024", plate: formatPlate("K", "609178"), status: "completed", pickup: formatDateCompact(8, 5, 2024), returnDate: formatDateCompact(12, 5, 2024), urgency: "normal", total: formatCurrency(340), balance: formatCurrency(0), payment: "paid", action: "عرض التفاصيل" },
  { id: "R-2413", customer: "خالد الزهراني", phone: "054 632 0884", area: "طرابلس — الميناء", vehicle: "Chevrolet Tahoe 2023", plate: formatPlate("J", "301894"), status: "completed", pickup: formatDateCompact(5, 5, 2024), returnDate: formatDateCompact(10, 5, 2024), urgency: "normal", total: formatCurrency(920), balance: formatCurrency(0), payment: "paid", action: "عرض التفاصيل" },
  { id: "R-2412", customer: "مؤسسة أفق التقنية", phone: "011 456 9023", area: "بيروت — الأشرفية", vehicle: "Toyota Corolla 2024", plate: formatPlate("T", "518267"), status: "reserved", pickup: formatDateCompact(19, 5, 2024), returnDate: formatDateCompact(21, 5, 2024), urgency: "soon", total: formatCurrency(225), balance: formatCurrency(110), payment: "partial", action: "تأكيد التسليم" },
  { id: "R-2411", customer: "مازن القحطاني", phone: "050 218 7436", area: "زحلة — البقاع", vehicle: "Ford Explorer 2022", plate: formatPlate("N", "442976"), status: "active", pickup: formatDateCompact(15, 5, 2024), returnDate: formatDateCompact(24, 5, 2024), urgency: "normal", total: formatCurrency(840), balance: formatCurrency(840), payment: "unpaid", action: "تمديد الإيجار" },
];

export function SearchFilters({ query, setQuery, status, setStatus }: { query: string; setQuery: (value: string) => void; status: string; setStatus: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--ro-border)] bg-[var(--ro-surface)] px-4 py-3 sm:flex-row sm:items-center sm:px-6">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">البحث في الإيجارات</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="ابحث باسم العميل أو رقم العقد أو المركبة" className="h-10 w-full rounded-lg border border-[var(--ro-border)] bg-[var(--ro-bg)] px-3 text-sm outline-none placeholder:text-[var(--ro-text-faint)] focus:border-[var(--ro-primary)] focus:ring-2 focus:ring-[var(--ro-primary)]/15" />
      </label>
      <label className="flex items-center gap-2 text-sm text-[var(--ro-text-muted)]">
        <span className="whitespace-nowrap">الحالة</span>
        <div className="relative">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 min-w-[150px] appearance-none rounded-lg border border-[var(--ro-border)] bg-[var(--ro-surface)] py-0 ps-3 pe-8 text-sm font-semibold text-[var(--ro-text)] outline-none focus:border-[var(--ro-primary)]">
            <option value="all">كل الحالات</option><option value="active">نشط</option><option value="overdue">متأخر الإرجاع</option><option value="reserved">محجوز</option><option value="completed">مكتمل</option>
          </select>
        </div>
      </label>
    </div>
  );
}

export function RentalStatus({ rental }: { rental: Rental }) { return <StatusBadge status={rentalStatus[rental.status]} size="sm" />; }
export function ReturnDate({ rental }: { rental: Rental }) { return <div className="flex flex-wrap items-center gap-1.5"><span className="tabular-nums">{rental.returnDate}</span>{rental.urgency !== "normal" && <StatusBadge status={returnUrgency[rental.urgency]} size="sm" />}</div>; }
export function Payment({ rental }: { rental: Rental }) { return <span className="tabular-nums font-semibold">{rental.balance}</span>; }

export function MobileRentalCard({ rental }: { rental: Rental }) {
  return <article className="border-b border-[var(--ro-border)] bg-[var(--ro-surface)] px-4 py-4 last:border-b-0">
    <div className="mb-3 flex items-start justify-between gap-3"><RentalStatus rental={rental} /><div className="text-end"><h3 className="text-sm font-bold">{rental.customer}</h3><div className="mt-0.5 text-xs text-[var(--ro-text-faint)]">{rental.area}</div></div></div>
    <div className="mb-3 flex items-center gap-2 border-y border-[var(--ro-border)] py-2.5 text-sm"><CarFront className="h-4 w-4 shrink-0 text-[var(--ro-primary)]" /><b className="text-[var(--ro-text)]">{rental.vehicle}</b><span className="text-[var(--ro-text-faint)]">·</span><span className="tabular-nums text-[var(--ro-text-faint)]">{rental.plate}</span></div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
      <div><span className="text-[var(--ro-text-faint)]">تاريخ الاستلام</span><b className="mt-1 flex items-center gap-1.5 tabular-nums"><CalendarDays className="h-3.5 w-3.5 text-[var(--ro-primary)]" />{rental.pickup}</b></div>
      <div><span className="text-[var(--ro-text-faint)]">تاريخ الإرجاع</span><div className="mt-1"><ReturnDate rental={rental} /></div></div>
      <div><span className="text-[var(--ro-text-faint)]">المبلغ الإجمالي</span><b className="mt-1 block tabular-nums">{rental.total}</b></div>
      <div><span className="text-[var(--ro-text-faint)]">الرصيد المتبقي</span><div className="mt-1 flex items-center gap-1.5"><Payment rental={rental} /><StatusBadge status={paymentStatus[rental.payment]} size="sm" /></div></div>
    </div>
    <button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ro-primary)] text-sm font-bold text-[var(--ro-primary)] hover:bg-[var(--ro-primary-soft)]">{rental.action}<ArrowLeft className="h-4 w-4" /></button>
  </article>;
}
