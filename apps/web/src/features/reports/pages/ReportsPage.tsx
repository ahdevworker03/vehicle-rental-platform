import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Printer,
  Receipt,
  TrendingDown,
  TrendingUp,
  WalletCards,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PeriodSelector, periodLabel } from "@/features/reports/components/PeriodSelector";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState, InfoBanner, LoadingState } from "@/components/ui/FeedbackState";
import { SectionCard } from "@/components/ui/SectionCard";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useReportData } from "@/features/reports/hooks";
import {
  buildReportSummary,
  getReportPeriodRange,
  toCsv,
  toPrintableHtml,
  type ReportPeriodType,
  type ReportSummary,
} from "@/features/reports/selectors";

function buildSummaryCsv(summary: ReportSummary, label: string): string {
  return toCsv([
    ["البند", "القيمة"],
    ["الفترة", label],
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

function buildSummaryHtml(summary: ReportSummary, label: string): string {
  return toPrintableHtml(
    `تقرير — ${label}`,
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
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function openPrintableWindow(html: string): boolean {
  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
}

function ReportMetricCard({
  label,
  context,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  context: string;
  value: number;
  icon: LucideIcon;
  tone?: "primary" | "positive" | "danger" | "warning";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    positive: "bg-status-positive-bg text-status-positive",
    danger: "bg-status-danger-bg text-status-danger",
    warning: "bg-status-warning-bg text-status-warning",
  };

  return (
    <SectionCard className="min-h-[146px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{context}</p>
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            toneClass[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p
        className={cn(
          "mt-4 text-2xl font-bold tracking-tight tabular-nums",
          tone === "danger" ? "text-status-danger" : "text-foreground",
        )}
      >
        {formatCurrency(value)}
      </p>
    </SectionCard>
  );
}

function ActivityMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="flex min-h-20 items-center gap-3 rounded-lg border border-border px-3 py-3 sm:px-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-bold tabular-nums text-foreground">
          {formatNumber(value)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ReportRow({
  label,
  context,
  value,
  children,
}: {
  label: string;
  context: string;
  value: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,auto)] sm:items-center sm:gap-y-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{context}</p>
      </div>
      <div className="text-left text-sm font-bold tabular-nums text-foreground">
        {value}
      </div>
      {children && <div className="col-span-2 mt-1">{children}</div>}
    </div>
  );
}

function isEmptySummary(summary: ReportSummary) {
  return (
    summary.revenue === 0 &&
    summary.expenses === 0 &&
    summary.maintenanceCost === 0 &&
    summary.rentalCount === 0 &&
    summary.maintenanceCount === 0 &&
    summary.paymentCount === 0 &&
    summary.completedTaskCount === 0
  );
}

export default function ReportsPage() {
  const now = new Date();
  const [periodType, setPeriodType] = useState<ReportPeriodType>("month");
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const {
    payments,
    expenses,
    maintenance,
    rentals,
    tasks,
    isLoading,
    isError,
    error,
  } = useReportData();

  const range = useMemo(
    () => getReportPeriodRange(periodType, month, year),
    [periodType, month, year],
  );
  const summary = useMemo(
    () =>
      buildReportSummary(range, {
        payments,
        expenses,
        maintenance,
        rentals,
        tasks,
      }),
    [range, payments, expenses, maintenance, rentals, tasks],
  );
  const label = periodLabel(periodType, month, year);
  const hasNoActivity = isEmptySummary(summary);

  function handleExportCsv() {
    setActionError(null);
    try {
      const csv = buildSummaryCsv(summary, label);
      downloadCsv(`report-${label.replace(/\s+/g, "-")}.csv`, csv);
      setActionFeedback(`تم تجهيز ملف CSV لتقرير ${label}.`);
    } catch {
      setActionFeedback(null);
      setActionError(`تعذر تصدير تقرير ${label}. حاول مرة أخرى دون تغيير الفترة المحددة.`);
    }
  }

  function handlePrint() {
    setActionError(null);
    try {
      if (!openPrintableWindow(buildSummaryHtml(summary, label))) {
        setActionError(`تعذر فتح معاينة طباعة تقرير ${label}. اسمح بالنوافذ المنبثقة ثم أعد المحاولة.`);
        return;
      }
      setActionFeedback(`تم فتح معاينة طباعة تقرير ${label}.`);
    } catch {
      setActionFeedback(null);
      setActionError(`تعذر فتح معاينة طباعة تقرير ${label}. حاول مرة أخرى دون تغيير الفترة المحددة.`);
    }
  }

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        aria-label="طباعة التقرير"
      >
        <Printer aria-hidden="true" />
        <span>طباعة</span>
      </Button>
      <Button
        size="sm"
        onClick={handleExportCsv}
        aria-label="تصدير التقرير بصيغة CSV"
      >
        <Download aria-hidden="true" />
        <span>CSV</span>
      </Button>
    </div>
  );

  return (
    <div className="min-h-full">
      <PageHeader title="التقارير" action={actions} />

      <main className="space-y-5 px-4 pb-8 pt-4 sm:px-6 lg:space-y-6 lg:pt-6">
        <SectionCard
          title="إعداد التقرير"
          description="اختر الفترة لعرض ملخص مالي وتشغيلي قابل للطباعة والتصدير."
        >
          <PeriodSelector
            type={periodType}
            month={month}
            year={year}
            onTypeChange={setPeriodType}
            onMonthChange={setMonth}
            onYearChange={setYear}
          />
        </SectionCard>
        {actionError && <ErrorState title="تعذر تنفيذ الإجراء" description={actionError} />}
        {actionFeedback && !actionError && <InfoBanner>{actionFeedback}</InfoBanner>}

        {isLoading ? (
          <section
            aria-label="جارٍ تحميل التقرير"
            className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.75fr)]"
          >
            <SectionCard>
              <LoadingState rows={4} />
            </SectionCard>
            <SectionCard>
              <LoadingState rows={4} />
            </SectionCard>
          </section>
        ) : isError ? (
          <SectionCard>
            <ErrorState
              title="تعذر تحميل التقرير"
              description={
                error
                  ? getApiErrorMessage(error).title
                  : "تحقق من الاتصال ثم حاول مرة أخرى."
              }
            />
          </SectionCard>
        ) : (
          <>
            <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-end">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="ui-section-title">تقرير الفترة المحددة</h2>
                  <p className="ui-secondary-text mt-1 inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {label}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                يتضمن القيم المسجلة ضمن الفترة فقط.
              </p>
            </div>

            <section
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
              aria-label="الملخص المالي للتقرير"
            >
              <ReportMetricCard
                label="الإيرادات"
                context="دفعات مسجلة"
                value={summary.revenue}
                icon={WalletCards}
              />
              <ReportMetricCard
                label="المصروفات"
                context="مصروفات مسجلة"
                value={summary.expenses}
                icon={Receipt}
                tone="danger"
              />
              <ReportMetricCard
                label="صافي الربح"
                context="الإيرادات ناقص المصروفات"
                value={summary.netProfit}
                icon={summary.netProfit < 0 ? TrendingDown : TrendingUp}
                tone={summary.netProfit < 0 ? "danger" : "positive"}
              />
              <ReportMetricCard
                label="تكلفة الصيانة"
                context="معروضة بشكل منفصل"
                value={summary.maintenanceCost}
                icon={Wrench}
                tone="warning"
              />
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.75fr)]">
              <SectionCard
                title="معاينة التقرير"
                description="ملخص القيم التي ستظهر في النسخة المطبوعة وملف CSV."
              >
                <div className="divide-y divide-border rounded-lg border border-border">
                  <ReportRow
                    label="الإيرادات"
                    context="دفعات الإيجارات المسجلة"
                    value={formatCurrency(summary.revenue)}
                  />
                  <ReportRow
                    label="المصروفات"
                    context="مصروفات الأعمال المسجلة"
                    value={formatCurrency(summary.expenses)}
                  />
                  <ReportRow
                    label="صافي الربح"
                    context="الإيرادات ناقص المصروفات"
                    value={formatCurrency(summary.netProfit)}
                  />
                  <ReportRow
                    label="تكلفة الصيانة"
                    context="تكلفة منفصلة عن المصروفات"
                    value={formatCurrency(summary.maintenanceCost)}
                  />
                </div>
                <div className="mt-4 rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                  لا تدخل تكلفة الصيانة في صافي الربح المعروض، وتبقى مفصّلة
                  كتكلفة تشغيلية مستقلة.
                </div>
              </SectionCard>

              <SectionCard
                title="ملخص العمليات"
                description="عدد السجلات المسجلة في الفترة."
              >
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <ActivityMetric
                    label="الإيجارات"
                    value={summary.rentalCount}
                    icon={FileText}
                  />
                  <ActivityMetric
                    label="المدفوعات"
                    value={summary.paymentCount}
                    icon={WalletCards}
                  />
                  <ActivityMetric
                    label="سجلات الصيانة"
                    value={summary.maintenanceCount}
                    icon={Wrench}
                  />
                  <ActivityMetric
                    label="المهام المكتملة"
                    value={summary.completedTaskCount}
                    icon={CheckCircle2}
                  />
                </div>
              </SectionCard>
            </div>

            {hasNoActivity && (
              <SectionCard>
                <EmptyState
                  icon={FileText}
                  title="لا يوجد نشاط في هذه الفترة"
                  description="غيّر الفترة أو أضف سجلات مالية وتشغيلية لعرض التقرير."
                  className="py-8"
                />
              </SectionCard>
            )}
          </>
        )}
      </main>
    </div>
  );
}
