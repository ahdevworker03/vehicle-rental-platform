import { ChevronDown } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/utils";
import { ARABIC_MONTH_NAMES } from "@/lib/format";
import type { ReportPeriodType } from "@/features/reports/selectors";

const QUARTER_LABELS = [
  "الربع الأول",
  "الربع الثاني",
  "الربع الثالث",
  "الربع الرابع",
];

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
  return ARABIC_MONTH_NAMES.map((label, i) => ({ label, value: String(i) }));
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

function PeriodSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="ui-label">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 pe-10 text-sm font-semibold text-foreground shadow-sm outline-none transition-colors hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </span>
    </label>
  );
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
    <div className={cn("space-y-4", className)}>
      <SegmentedControl
        options={PERIOD_TYPE_OPTIONS}
        value={type}
        onChange={(v) => onTypeChange(v as ReportPeriodType)}
      />

      {type === "month" && (
        <div className="grid gap-4 sm:max-w-xl sm:grid-cols-[minmax(0,1fr)_11rem]">
          <PeriodSelect
            label="الشهر"
            value={String(month)}
            options={monthOptions()}
            onChange={(value) => onMonthChange(Number(value))}
          />
          <PeriodSelect
            label="السنة"
            value={String(year)}
            options={yearOptions()}
            onChange={(value) => onYearChange(Number(value))}
          />
        </div>
      )}

      {type === "quarter" && (
        <div className="grid gap-4 sm:max-w-xl sm:grid-cols-[minmax(0,1fr)_11rem]">
          <PeriodSelect
            label="الربع"
            value={String(quarter)}
            options={quarterOptions()}
            onChange={(value) => onMonthChange(Number(value) * 3)}
          />
          <div className="max-w-44"><PeriodSelect label="السنة" value={String(year)} options={yearOptions()} onChange={(value) => onYearChange(Number(value))} /></div>
        </div>
      )}

      {type === "year" && (
        <PeriodSelect
          label="السنة"
          value={String(year)}
          options={yearOptions()}
          onChange={(value) => onYearChange(Number(value))}
        />
      )}
    </div>
  );
}

/** Human-readable label for the currently selected period. */
export function periodLabel(
  type: ReportPeriodType,
  month: number,
  year: number,
): string {
  if (type === "year") return String(year);
  if (type === "quarter") {
    const q = Math.floor(month / 3) + 1;
    return `${QUARTER_LABELS[q - 1]} ${year}`;
  }
  return `${ARABIC_MONTH_NAMES[month]} ${year}`;
}
