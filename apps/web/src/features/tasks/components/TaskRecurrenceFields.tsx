import { FormField, inputClass } from "@/components/ui/FormField";
import { DatePicker } from "@/components/ui/date-picker";
import {
  changeTaskRecurrenceEndMode,
  changeTaskRecurrenceMode,
  type TaskRecurrenceEndMode,
  type TaskRecurrenceErrors,
  type TaskRecurrenceFormState,
  type TaskRecurrenceMode,
  type TaskRecurrenceUnit,
} from "@/features/tasks/recurrence";

interface TaskRecurrenceFieldsProps {
  value: TaskRecurrenceFormState;
  errors?: TaskRecurrenceErrors;
  idPrefix: string;
  onChange: (value: TaskRecurrenceFormState) => void;
}

export function TaskRecurrenceFields({ value, errors = {}, idPrefix, onChange }: TaskRecurrenceFieldsProps) {
  const recurrenceId = `${idPrefix}-recurrence`;
  const intervalId = `${idPrefix}-interval`;
  const unitId = `${idPrefix}-unit`;
  const endModeId = `${idPrefix}-end-mode`;
  const endDateId = `${idPrefix}-end-date`;
  const endCountId = `${idPrefix}-end-count`;

  return (
    <div className="grid min-w-0 gap-4 md:col-span-2 md:grid-cols-2">
      <FormField label="التكرار" hint="تُنشأ المهمة التالية عند إكمال الحالية." className="md:col-span-2" htmlFor={recurrenceId}>
        <select
          id={recurrenceId}
          className={inputClass}
          value={value.mode}
          onChange={(event) => onChange(changeTaskRecurrenceMode(value, event.target.value as TaskRecurrenceMode))}
        >
          <option value="NONE">بدون تكرار</option>
          <option value="DAILY">يومي</option>
          <option value="WEEKLY">أسبوعي</option>
          <option value="MONTHLY">شهري</option>
          <option value="CUSTOM">مخصص</option>
        </select>
      </FormField>

      {value.mode === "CUSTOM" && (
        <fieldset className="grid min-w-0 gap-3 rounded-lg border border-border bg-muted/30 p-3 md:col-span-2 md:grid-cols-2">
          <legend className="px-1 text-sm font-semibold text-foreground">كرر كل</legend>
          <FormField label="الفاصل" required error={errors.interval} htmlFor={intervalId}>
            <input
              id={intervalId}
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              dir="ltr"
              className={inputClass}
              value={value.interval}
              aria-invalid={Boolean(errors.interval)}
              onChange={(event) => onChange({ ...value, interval: event.target.value })}
            />
          </FormField>
          <FormField label="الوحدة" required htmlFor={unitId}>
            <select
              id={unitId}
              className={inputClass}
              value={value.unit}
              onChange={(event) => onChange({ ...value, unit: event.target.value as TaskRecurrenceUnit })}
            >
              <option value="DAY">يوم</option>
              <option value="WEEK">أسبوع</option>
              <option value="MONTH">شهر</option>
            </select>
          </FormField>
        </fieldset>
      )}

      {value.mode !== "NONE" && (
        <>
          <FormField label="ينتهي" className="md:col-span-2" htmlFor={endModeId}>
            <select
              id={endModeId}
              className={inputClass}
              value={value.endMode}
              onChange={(event) => onChange(changeTaskRecurrenceEndMode(value, event.target.value as TaskRecurrenceEndMode))}
            >
              <option value="NEVER">لا ينتهي</option>
              <option value="DATE">في تاريخ</option>
              <option value="COUNT">بعد عدد مرات</option>
            </select>
          </FormField>
          {value.endMode === "DATE" && (
            <FormField label="تاريخ انتهاء التكرار" required error={errors.endDate} htmlFor={endDateId}>
              <DatePicker
                id={endDateId}
                className={errors.endDate ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                value={value.endDate}
                aria-invalid={Boolean(errors.endDate)}
                onChange={(endDate) => onChange({ ...value, endDate, endCount: "" })}
              />
            </FormField>
          )}
          {value.endMode === "COUNT" && (
            <FormField label="عدد المرات" required hint="يشمل المهمة الحالية." error={errors.endCount} htmlFor={endCountId}>
              <input
                id={endCountId}
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                dir="ltr"
                className={inputClass}
                value={value.endCount}
                aria-invalid={Boolean(errors.endCount)}
                onChange={(event) => onChange({ ...value, endCount: event.target.value, endDate: "" })}
              />
            </FormField>
          )}
        </>
      )}
    </div>
  );
}
