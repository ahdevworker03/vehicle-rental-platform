import * as React from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import type { Matcher } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateOnly(value: string): Date | undefined {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : undefined;
}

function todayDate(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
}

function toDateOnly(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

function DatePicker({
  id,
  value,
  onChange,
  disabled = false,
  min,
  max,
  placeholder = "اختر تاريخًا",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const selected = parseDateOnly(value);
  const minDate = parseDateOnly(min ?? "");
  const maxDate = parseDateOnly(max ?? "");
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(selected ?? todayDate);

  React.useEffect(() => {
    if (selected) setMonth(selected);
  }, [value]);

  const disabledDates: Matcher | Matcher[] | undefined = disabled
    ? () => true
    : (() => {
        const matchers: Matcher[] = [];
        if (minDate) matchers.push({ before: minDate });
        if (maxDate) matchers.push({ after: maxDate });
        return matchers.length > 0 ? matchers : undefined;
      })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          aria-invalid={ariaInvalid}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={id ? `${id}-popover` : undefined}
          className={cn(
            "w-full min-h-11 justify-between gap-3 px-3 py-2.5 text-start font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
            <span dir="ltr" className="number-ltr truncate">
              {selected ? formatDate(value) : placeholder}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        id={id ? `${id}-popover` : undefined}
        align="center"
        className="w-[min(22rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border-popover-border bg-popover p-0 shadow-lg"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(toDateOnly(date));
            setOpen(false);
          }}
          month={month}
          onMonthChange={setMonth}
          autoFocus
          disabled={disabledDates}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
export type { DatePickerProps };
