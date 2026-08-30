import type { RentalResponse, TaskResponse, VehicleResponse } from "@workspace/api-client-react";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { isDateInPeriod, type ReportPeriodRange, type ReportSummary } from "./selectors";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function table(title: string, rows: Array<[string, string]>): string {
  return `<section><h2>${title}</h2><table><tbody>${rows.map(([label, value]) => `<tr><th>${label}</th><td dir="ltr">${value}</td></tr>`).join("")}</tbody></table></section>`;
}

function periodDates(range: ReportPeriodRange): { start: string; end: string } {
  return {
    start: formatDate(new Date(Date.UTC(range.startYear, range.startMonth, 1))),
    end: formatDate(new Date(Date.UTC(range.endYear, range.endMonth, 0))),
  };
}

export function buildBusinessReportHtml({
  summary,
  label,
  range,
  rentals,
  tasks,
  vehicles,
  vehiclesUnavailable,
  companyName,
}: {
  summary: ReportSummary;
  label: string;
  range: ReportPeriodRange;
  rentals: RentalResponse[];
  tasks: TaskResponse[];
  vehicles: VehicleResponse[];
  vehiclesUnavailable: boolean;
  companyName: string | null;
}): string {
  const dates = periodDates(range);
  const periodRentals = rentals.filter((rental) => isDateInPeriod(rental.createdAt, range));
  const periodTasks = tasks.filter((task) => isDateInPeriod(task.dueDate, range));
  const now = new Date();
  const unavailable = "غير متاح";
  const fleet = vehiclesUnavailable
    ? [unavailable, unavailable, unavailable, unavailable, unavailable]
    : [
        formatNumber(vehicles.length),
        formatNumber(vehicles.filter((vehicle) => vehicle.status === "AVAILABLE").length),
        formatNumber(vehicles.filter((vehicle) => vehicle.status === "RENTED").length),
        formatNumber(vehicles.filter((vehicle) => vehicle.status === "MAINTENANCE").length),
        formatNumber(vehicles.filter((vehicle) => vehicle.status === "OUT_OF_SERVICE").length),
      ];

  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8" /><title>تقرير الأعمال — ${escapeHtml(label)}</title><style>
    body { font-family: Tahoma, Arial, sans-serif; color: #172033; margin: 0; line-height: 1.65; }
    main { max-width: 860px; margin: 0 auto; padding: 36px 42px; }
    header { border-bottom: 2px solid #1d4f6e; padding-bottom: 14px; }
    h1 { margin: 0; color: #123b56; font-size: 24px; } h2 { margin: 26px 0 9px; color: #123b56; font-size: 16px; }
    .metadata { margin: 12px 0 0; color: #475569; } .metadata p { margin: 3px 0; }
    table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #d7dee7; padding: 8px 11px; font-size: 13px; }
    th { width: 68%; background: #f8fafc; text-align: right; } td { text-align: left; font-weight: 700; white-space: nowrap; }
    .notes { margin: 0; padding-right: 20px; } .notes li { margin: 5px 0; }
    @media print { main { padding: 0; } }
  </style></head><body><main>
    <header><h1>تقرير الأعمال — ${escapeHtml(label)}</h1><div class="metadata"><p>الفترة: من <span dir="ltr">${dates.start}</span> إلى <span dir="ltr">${dates.end}</span></p><p>تاريخ إنشاء التقرير: <span dir="ltr">${formatDate(now)}</span></p><p>الشركة: ${escapeHtml(companyName ?? unavailable)}</p></div></header>
    ${table("1. الملخص العام", [["إجمالي الإيرادات", formatCurrency(summary.revenue)], ["إجمالي المصروفات", formatCurrency(summary.expenses + summary.maintenanceCost)], ["صافي الربح", formatCurrency(summary.netProfit)], ["عدد الإيجارات", formatNumber(summary.rentalCount)], ["عدد المدفوعات", formatNumber(summary.paymentCount)], ["عدد سجلات الصيانة", formatNumber(summary.maintenanceCount)], ["عدد المهام المكتملة", formatNumber(summary.completedTaskCount)]])}
    ${table("2. الملخص المالي", [["إيرادات الإيجارات", formatCurrency(summary.revenue)], ["المصروفات التشغيلية", formatCurrency(summary.expenses)], ["تكلفة الصيانة", formatCurrency(summary.maintenanceCost)], ["إجمالي المصروفات", formatCurrency(summary.expenses + summary.maintenanceCost)], ["صافي الربح", formatCurrency(summary.netProfit)]])}
    ${table("3. نشاط الإيجارات", [["عدد الإيجارات الجديدة", formatNumber(summary.rentalCount)], ["الإيجارات النشطة", formatNumber(periodRentals.filter((rental) => rental.status === "ACTIVE").length)], ["الإيجارات المكتملة", formatNumber(periodRentals.filter((rental) => rental.status === "RETURNED").length)], ["الإيجارات الملغاة", formatNumber(periodRentals.filter((rental) => rental.status === "CANCELLED").length)], ["المدفوعات المسجلة", formatNumber(summary.paymentCount)]])}
    ${table("4. حالة الأسطول الحالية", [["إجمالي المركبات", fleet[0]], ["المركبات المتاحة", fleet[1]], ["المركبات المؤجرة", fleet[2]], ["المركبات تحت الصيانة", fleet[3]], ["المركبات خارج الخدمة", fleet[4]]])}
    ${table("5. الصيانة والمهام", [["سجلات الصيانة", formatNumber(summary.maintenanceCount)], ["تكلفة الصيانة", formatCurrency(summary.maintenanceCost)], ["المهام المكتملة", formatNumber(summary.completedTaskCount)], ["المهام المعلقة", formatNumber(periodTasks.filter((task) => task.status === "PENDING").length)], ["المهام المتأخرة", formatNumber(periodTasks.filter((task) => task.status === "PENDING" && new Date(task.dueDate) < now).length)]])}
    <section><h2>6. ملاحظات التقرير</h2><ul class="notes"><li>هذا التقرير يعرض ملخصاً تشغيلياً ومالياً للفترة المحددة.</li><li>الأرقام تعتمد على البيانات المسجلة داخل النظام خلال فترة التقرير.</li><li>القيم المالية لا تشمل أي مدفوعات أو مصروفات غير مسجلة في النظام.</li><li>صافي الربح المعروض يحافظ على تعريف النظام الحالي: الإيرادات ناقص المصروفات التشغيلية، بينما تظهر تكلفة الصيانة بشكل منفصل.</li><li>حالة الأسطول تمثل الحالة الحالية عند إنشاء التقرير.</li></ul></section>
  </main></body></html>`;
}
