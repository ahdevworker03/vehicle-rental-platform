import { SegmentedControl } from "./SegmentedControl";
import { cn } from "@/lib/utils";
import type { ReportPeriodType } from "@/features/reports/selectors";

const LEBANESE_MONTHS = [
  "كانون الثاني",
  "شباط",
  "آذار",
  "نيسان",
  "أيار",
  "حزيران",
  "تموز",
  "آب",
  "أيلول",
  "تشرين الأول",
  "تشرين الثاني",
  "كانون الأول",
];

const QUARTER_LABELS = ["الربع الأول", "الربع الثاني", "الربع الثالث", "الربع الرابع"];

const PERIOD_TYPE_OPTIONS = [
  { label: "شهر", value: "month" },
  { label: "ربع", value: "quarter" },
  { label: "سنة", value: "year" },
];

/**
 * Year range offered in the year picker. Covers the current year and a few
 * years either side so the user can pick historical or upcoming periods.
 */
const YEAR_RANGE_START = 2020;
const YEAR_RANGE_END = 2030;

function yearOptions(): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  for (let y = YEAR_RANGE_START; y <= YEAR_RANGE_END; y++) {
    out.push({ label: String(y), value: String(y) });
  }
  return out;
}

function monthOptions(): { label: string; value: string }[] {
  return LEBANESE_MONTHS.map((label, i) => ({ label, value: String(i) }));
}

function quarterOptions(): { label: string; value: string }[] {
  return QUARTER_LABELS.map((label, i) => ({ label, value: String(i) }));
}

interface PeriodSelectorProps {
  type: ReportPeriodType;
  month: number;
  year: number;
  onTypeChange: (type: ReportPeriodType) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  className?: string;
}

export function PeriodSelector({
  type,
  month,
  year,
  onTypeChange,
  onMonthChange,
  onYearChange,
  className,
}: PeriodSelectorProps) {
  const quarter = Math.floor(month / 3);

  return (
    <div className={cn("space-y-3", className)}>
      <SegmentedControl
        options={PERIOD_TYPE_OPTIONS}
        value={type}
        onChange={(v) => onTypeChange(v as ReportPeriodType)}
      />

      {type === "month" && (
        <div className="grid grid-cols-2 gap-2">
          <SegmentedControl
            options={monthOptions()}
            value={String(month)}
            onChange={(v) => onMonthChange(Number(v))}
          />
          <SegmentedControl
            options={yearOptions()}
            value={String(year)}
            onChange={(v) => onYearChange(Number(v))}
          />
        </div>
      )}

      {type === "quarter" && (
        <div className="grid grid-cols-2 gap-2">
          <SegmentedControl
            options={quarterOptions()}
            value={String(quarter)}
            onChange={(v) => onMonthChange(Number(v) * 3)}
          />
          <SegmentedControl
            options={yearOptions()}
            value={String(year)}
            onChange={(v) => onYearChange(Number(v))}
          />
        </div>
      )}

      {type === "year" && (
        <SegmentedControl
          options={yearOptions()}
          value={String(year)}
          onChange={(v) => onYearChange(Number(v))}
        />
      )}
    </div>
  );
}

/** Human-readable label for the currently selected period. */
export function periodLabel(type: ReportPeriodType, month: number, year: number): string {
  if (type === "year") return String(year);
  if (type === "quarter") {
    const q = Math.floor(month / 3) + 1;
    return `${QUARTER_LABELS[q - 1]} ${year}`;
  }
  return `${LEBANESE_MONTHS[month]} ${year}`;
}
