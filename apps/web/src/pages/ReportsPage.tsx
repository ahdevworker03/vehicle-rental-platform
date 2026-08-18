import { useState, useMemo } from "react";
import { FileText, Download, Printer, TrendingUp, TrendingDown, DollarSign, Receipt, Wrench, CheckCircle2, Calendar, AlertCircle, Car } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PeriodSelector, periodLabel } from "@/components/ui/PeriodSelector";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useReportData } from "@/features/reports/hooks";
import {
  getReportPeriodRange,
  buildReportSummary,
  toCsv,
  toPrintableHtml,
  type ReportPeriodType,
  type ReportSummary,
} from "@/features/reports/selectors";

function SummaryCard({
  label,
  value,
  icon: Icon,
  variant,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  variant: "revenue" | "expense" | "profit-positive" | "profit-negative" | "maintenance";
}) {
  const variantMap: Record<typeof variant, string> = {
    revenue: "bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))]",
    expense: "bg-[hsl(var(--status-danger-bg))] text-[hsl(var(--status-danger))]",
    "profit-positive": "bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))]",
    "profit-negative": "bg-[hsl(var(--status-danger-bg))] text-[hsl(var(--status-danger))]",
    maintenance: "bg-[hsl(var(--status-maintenance-bg))] text-[hsl(var(--status-maintenance))]",
  };

  return (
    <div className={cn("rounded-2xl p-4 flex flex-col gap-2", variantMap[variant])}>
      <div className="flex items-center gap-2 text-sm font-medium opacity-90">
        <Icon className="w-4 h-4" strokeWidth={2} />
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function CountCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl p-4 bg-card border border-card-border flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

/** Build the CSV rows for the report summary. */
function buildSummaryCsv(summary: ReportSummary, periodLabel: string): string {
  return toCsv([
    ["البند", "القيمة"],
    ["الفترة", periodLabel],
    ["الإيرادات", summary.revenue],
    ["المصروفات", summary.expenses],
    ["صافي الربح", summary.netProfit],
    ["تكلفة الصيانة", summary.maintenanceCost],
    ["عدد الإيجارات", summary.rentalCount],
    ["عدد سجلات الصيانة", summary.maintenanceCount],
    ["عدد المدفوعات", summary.paymentCount],
    ["عدد المهام المكتملة", summary.completedTaskCount],
  ]);
}

/** Build the printable HTML for the report summary. */
function buildSummaryHtml(summary: ReportSummary, periodLabel: string): string {
  return toPrintableHtml(
    `تقرير — ${periodLabel}`,
    ["البند", "القيمة"],
    [
      ["الإيرادات", formatCurrency(summary.revenue)],
      ["المصروفات", formatCurrency(summary.expenses)],
      ["صافي الربح", formatCurrency(summary.netProfit)],
      ["تكلفة الصيانة", formatCurrency(summary.maintenanceCost)],
      ["عدد الإيجارات", summary.rentalCount],
      ["عدد سجلات الصيانة", summary.maintenanceCount],
      ["عدد المدفوعات", summary.paymentCount],
      ["عدد المهام المكتملة", summary.completedTaskCount],
    ],
  );
}

function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function openPrintableWindow(html: string): void {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

export default function ReportsPage() {
  const now = new Date();
  const [periodType, setPeriodType] = useState<ReportPeriodType>("month");
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const { payments, expenses, maintenance, rentals, tasks, isLoading, isError, error } = useReportData();

  const range = useMemo(
    () => getReportPeriodRange(periodType, month, year),
    [periodType, month, year],
  );

  const summary = useMemo(
    () => buildReportSummary(range, { payments, expenses, maintenance, rentals, tasks }),
    [range, payments, expenses, maintenance, rentals, tasks],
  );

  const label = periodLabel(periodType, month, year);

  const profitVariant = summary.netProfit >= 0 ? "profit-positive" : "profit-negative";
  const ProfitIcon = summary.netProfit >= 0 ? TrendingUp : TrendingDown;

  function handleExportCsv() {
    const csv = buildSummaryCsv(summary, label);
    const safeLabel = label.replace(/\s+/g, "-");
    downloadCsv(`report-${safeLabel}.csv`, csv);
  }

  function handlePrint() {
    const html = buildSummaryHtml(summary, label);
    openPrintableWindow(html);
  }

  return (
    <div className="min-h-full">
      <PageHeader title="التقارير" />

      <div className="px-4 pt-4 pb-6 space-y-5">
        <PeriodSelector
          type={periodType}
          month={month}
          year={year}
          onTypeChange={setPeriodType}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-6" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertCircle}
            title="حدث خطأ"
            description={error ? getApiErrorMessage(error).title : "تعذر تحميل بيانات التقرير"}
            className="py-16"
          />
        ) : (
          <>
            {/* Period label + actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calendar className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                {label}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  aria-label="عرض للطباعة"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted active:scale-95 transition-transform"
                >
                  <Printer className="w-4 h-4" strokeWidth={1.75} />
                  طباعة
                </button>
                <button
                  onClick={handleExportCsv}
                  aria-label="تصدير CSV"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition-transform"
                >
                  <Download className="w-4 h-4" strokeWidth={1.75} />
                  CSV
                </button>
              </div>
            </div>

            {/* Financial summary */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <SummaryCard
                label="الإيرادات"
                value={formatCurrency(summary.revenue)}
                icon={DollarSign}
                variant="revenue"
              />
              <SummaryCard
                label="المصروفات"
                value={formatCurrency(summary.expenses)}
                icon={Receipt}
                variant="expense"
              />
              <SummaryCard
                label="صافي الربح"
                value={formatCurrency(summary.netProfit)}
                icon={ProfitIcon}
                variant={profitVariant}
              />
              <SummaryCard
                label="تكلفة الصيانة"
                value={formatCurrency(summary.maintenanceCost)}
                icon={Wrench}
                variant="maintenance"
              />
            </div>

            {/* Counts */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <CountCard label="الإيجارات" value={summary.rentalCount} icon={Car} />
              <CountCard label="سجلات الصيانة" value={summary.maintenanceCount} icon={Wrench} />
              <CountCard label="المدفوعات" value={summary.paymentCount} icon={DollarSign} />
              <CountCard label="المهام المكتملة" value={summary.completedTaskCount} icon={CheckCircle2} />
            </div>

            {/* Empty state for a period with no activity */}
            {summary.revenue === 0 &&
              summary.expenses === 0 &&
              summary.maintenanceCost === 0 &&
              summary.rentalCount === 0 &&
              summary.maintenanceCount === 0 &&
              summary.paymentCount === 0 &&
              summary.completedTaskCount === 0 && (
                <EmptyState
                  icon={FileText}
                  title="لا يوجد نشاط في هذه الفترة"
                  description="لا توجد إيرادات أو مصروفات أو صيانة أو مهام مكتملة في الفترة المحددة"
                  className="py-12"
                />
              )}
          </>
        )}
      </div>
    </div>
  );
}
