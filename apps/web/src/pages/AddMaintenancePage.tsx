import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Car, CheckCircle2, Plus, Search, X } from "lucide-react";
import type { CreateMaintenanceRequestType, MaintenanceReplacedPart } from "@workspace/api-client-react";
import { useListVehicles } from "@workspace/api-client-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineError, LoadingState } from "@/components/ui/FeedbackState";
import { FormField, inputClass } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { SectionCard } from "@/components/ui/SectionCard";
import { useMaintenanceMutations } from "@/features/maintenance/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/api-error";
import { MAINTENANCE_TYPE_OPTIONS } from "@/lib/labels";

interface PartDraft {
  name: string;
  brand: string;
  quantity: string;
  unitCost: string;
}

const EMPTY_PART: PartDraft = { name: "", brand: "", quantity: "", unitCost: "" };

function toISO(date: string): string {
  return new Date(`${date}T12:00:00Z`).toISOString();
}

function fieldClass(error?: string) {
  return error ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass;
}

export default function AddMaintenancePage() {
  const [, setLocation] = useLocation();
  const mutations = useMaintenanceMutations();
  const preVehicle = new URLSearchParams(window.location.search).get("vehicle") ?? "";
  const [selectedVehicleId, setSelectedVehicleId] = useState(preVehicle);
  const [showVehiclePicker, setShowVehiclePicker] = useState(!preVehicle);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const debouncedVehicleSearch = useDebouncedValue(vehicleSearch.trim(), 300);
  const [type, setType] = useState<CreateMaintenanceRequestType | "">("");
  const [maintenanceDate, setMaintenanceDate] = useState("");
  const [vendor, setVendor] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [parts, setParts] = useState<PartDraft[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const vehiclesQuery = useListVehicles();
  const vehicles = useMemo(() => vehiclesQuery.data?.data ?? [], [vehiclesQuery.data]);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId);
  const filteredVehicles = useMemo(() => {
    const query = debouncedVehicleSearch.toLowerCase();
    if (!query) return vehicles;
    return vehicles.filter((vehicle) => `${vehicle.make} ${vehicle.model} ${vehicle.plateNumber}`.toLowerCase().includes(query));
  }, [debouncedVehicleSearch, vehicles]);

  function clearError(key: string) {
    if (!errors[key]) return;
    setErrors((current) => { const next = { ...current }; delete next[key]; return next; });
  }

  function setPart(index: number, patch: Partial<PartDraft>) {
    setParts((current) => current.map((part, partIndex) => partIndex === index ? { ...part, ...patch } : part));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!selectedVehicleId) nextErrors.vehicle = "اختر مركبة.";
    if (!type) nextErrors.type = "اختر نوع الصيانة.";
    if (!maintenanceDate) nextErrors.maintenanceDate = "أدخل تاريخ الصيانة.";
    if (cost && (Number.isNaN(Number(cost)) || Number(cost) < 0)) nextErrors.cost = "أدخل تكلفة غير سالبة.";
    parts.forEach((part, index) => { if (!part.name.trim()) nextErrors[`part-${index}`] = "اسم القطعة مطلوب."; });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (mutations.create.isPending || !validate()) return;
    setFormError(null);
    const replacedParts: MaintenanceReplacedPart[] | undefined = parts.filter((part) => part.name.trim()).map((part) => ({
      name: part.name.trim(), ...(part.brand.trim() ? { brand: part.brand.trim() } : {}),
      ...(part.quantity.trim() ? { quantity: Math.max(1, Number.parseInt(part.quantity, 10)) } : {}),
      ...(part.unitCost.trim() ? { unitCost: Math.max(0, Number(part.unitCost)) } : {}),
    }));
    try {
      await mutations.create.mutateAsync({ data: {
        vehicle_id: selectedVehicleId, type: type as CreateMaintenanceRequestType, maintenance_date: toISO(maintenanceDate),
        ...(vendor.trim() ? { vendor: vendor.trim() } : {}), ...(cost ? { cost: Number(cost) } : {}), ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(replacedParts && replacedParts.length > 0 ? { replaced_parts: replacedParts } : {}),
      } });
      setSaved(true);
      setTimeout(() => setLocation("/maintenance"), 1200);
    } catch (error) {
      setFormError(getApiErrorMessage(error).title);
    }
  }

  const canSave = Boolean(selectedVehicleId && type && maintenanceDate);

  if (saved) return <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-background px-6 text-center"><span className="flex size-20 items-center justify-center rounded-full bg-status-positive-bg text-status-positive"><CheckCircle2 className="size-10" aria-hidden="true" /></span><h2 className="ui-page-title">تم تسجيل الصيانة</h2>{selectedVehicle && <p className="ui-secondary-text"><span dir="ltr">{selectedVehicle.make} {selectedVehicle.model}</span><br /><span dir="ltr" className="number-ltr">{selectedVehicle.plateNumber}</span></p>}<p className="text-xs text-muted-foreground">جارٍ العودة إلى سجل الصيانة...</p></div>;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="تسجيل صيانة" showBack onBack={() => setLocation("/maintenance")} />
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        <div><h2 className="ui-page-title">سجل صيانة جديد</h2><p className="ui-secondary-text mt-1">اختر المركبة وسجّل موعد الصيانة وتفاصيل العمل.</p></div>
        {formError && <InlineError className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">{formError}</InlineError>}

        <FormSection title="المركبة" description="اختر المركبة المرتبط بها سجل الصيانة." contentClassName="md:grid-cols-1">
          <FormField label="المركبة" required error={errors.vehicle} htmlFor="maintenance-vehicle-search">
            <button type="button" onClick={() => setShowVehiclePicker((current) => !current)} aria-expanded={showVehiclePicker} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-input bg-card px-3 py-2 text-start shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"><span className="flex min-w-0 items-center gap-2"><Car className="size-4 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0">{selectedVehicle ? <><span dir="ltr" className="block truncate text-sm font-semibold text-foreground">{selectedVehicle.make} {selectedVehicle.model}</span><span dir="ltr" className="number-ltr mt-0.5 block text-xs text-muted-foreground">{selectedVehicle.plateNumber}</span></> : <span className="text-sm text-muted-foreground">اختر مركبة</span>}</span></span><span className="text-xs font-medium text-primary">{showVehiclePicker ? "إخفاء" : "اختيار"}</span></button>
          </FormField>
          {showVehiclePicker && <div className="rounded-lg border border-border bg-muted/25 p-3"><div className="relative"><Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" aria-hidden="true" /><input id="maintenance-vehicle-search" type="search" value={vehicleSearch} onChange={(event) => setVehicleSearch(event.target.value)} placeholder="ابحث باسم المركبة أو رقم اللوحة..." className={`${inputClass} ps-10`} /></div><div className="mt-3 max-h-60 space-y-1 overflow-y-auto">{vehiclesQuery.isLoading ? <LoadingState rows={2} className="p-0" /> : filteredVehicles.length === 0 ? <EmptyState icon={Car} title="لا توجد مركبات مطابقة" description="جرّب كلمة بحث مختلفة." className="py-6" /> : filteredVehicles.map((vehicle) => <button key={vehicle.id} type="button" onClick={() => { setSelectedVehicleId(vehicle.id); setShowVehiclePicker(false); clearError("vehicle"); }} className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-start transition-colors ${selectedVehicleId === vehicle.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}><span className="min-w-0"><span dir="ltr" className="block truncate text-sm font-semibold text-foreground">{vehicle.make} {vehicle.model}</span><span dir="ltr" className="number-ltr mt-0.5 block text-xs text-muted-foreground">{vehicle.plateNumber}</span></span>{selectedVehicleId === vehicle.id && <CheckCircle2 className="size-4 shrink-0" aria-label="محددة" />}</button>)}</div></div>}
        </FormSection>

        <FormSection title="تفاصيل الصيانة" description="حدّد نوع الصيانة والموعد المطلوب.">
          <FormField label="نوع الصيانة" required error={errors.type} htmlFor="maintenance-type"><select id="maintenance-type" value={type} onChange={(event) => { setType(event.target.value as CreateMaintenanceRequestType); clearError("type"); }} className={fieldClass(errors.type)}><option value="">اختر نوع الصيانة</option>{MAINTENANCE_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></FormField>
          <FormField label="تاريخ الصيانة" required error={errors.maintenanceDate} htmlFor="maintenance-date"><input id="maintenance-date" type="date" dir="ltr" value={maintenanceDate} onChange={(event) => { setMaintenanceDate(event.target.value); clearError("maintenanceDate"); }} className={fieldClass(errors.maintenanceDate)} /></FormField>
        </FormSection>

        <FormSection title="التكلفة والمزوّد" description="أضف تقدير التكلفة والورشة أو المزوّد عند توفرها.">
          <FormField label="التكلفة المتوقعة" hint="اختيارية · USD" error={errors.cost} htmlFor="maintenance-cost"><input id="maintenance-cost" type="number" dir="ltr" inputMode="decimal" min={0} placeholder="150" value={cost} onChange={(event) => { setCost(event.target.value); clearError("cost"); }} className={fieldClass(errors.cost)} /></FormField>
          <FormField label="الورشة / المزوّد" hint="اختياري" htmlFor="maintenance-vendor"><input id="maintenance-vendor" value={vendor} onChange={(event) => setVendor(event.target.value)} placeholder="اسم ورشة الصيانة" className={inputClass} /></FormField>
          <FormField label="ملاحظات" hint="اختيارية" htmlFor="maintenance-notes" className="md:col-span-2"><textarea id="maintenance-notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="أي تفاصيل إضافية..." className={`${inputClass} resize-y`} /></FormField>
        </FormSection>

        <SectionCard title="القطع المبدلة" description="اختيارية، ويمكن إضافتها عند توفر تفاصيل القطع." action={<Button type="button" variant="ghost" size="sm" onClick={() => setParts((current) => [...current, { ...EMPTY_PART }])}><Plus className="size-4" aria-hidden="true" />إضافة قطعة</Button>}>
          {parts.length === 0 ? <p className="ui-secondary-text">لا توجد قطع مبدلة مسجلة.</p> : <div className="space-y-3">{parts.map((part, index) => <div key={index} className="rounded-lg border border-border p-3 sm:p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-foreground">قطعة {index + 1}</h3><Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/5" onClick={() => setParts((current) => current.filter((_, partIndex) => partIndex !== index))} aria-label={`حذف القطعة ${index + 1}`}><X className="size-4" aria-hidden="true" /></Button></div><div className="grid gap-3 md:grid-cols-2"><FormField label="الاسم" required error={errors[`part-${index}`]} htmlFor={`maintenance-part-name-${index}`} className="md:col-span-2"><input id={`maintenance-part-name-${index}`} value={part.name} onChange={(event) => { setPart(index, { name: event.target.value }); clearError(`part-${index}`); }} placeholder="مثال: بواجي" className={fieldClass(errors[`part-${index}`])} /></FormField><FormField label="الماركة" hint="اختيارية" htmlFor={`maintenance-part-brand-${index}`}><input id={`maintenance-part-brand-${index}`} value={part.brand} onChange={(event) => setPart(index, { brand: event.target.value })} placeholder="Bosch" className={inputClass} /></FormField><FormField label="الكمية" hint="اختيارية" htmlFor={`maintenance-part-quantity-${index}`}><input id={`maintenance-part-quantity-${index}`} type="number" dir="ltr" inputMode="numeric" min={1} value={part.quantity} onChange={(event) => setPart(index, { quantity: event.target.value })} placeholder="1" className={inputClass} /></FormField><FormField label="سعر الوحدة" hint="اختياري · USD" htmlFor={`maintenance-part-cost-${index}`} className="md:col-span-2"><input id={`maintenance-part-cost-${index}`} type="number" dir="ltr" inputMode="decimal" min={0} value={part.unitCost} onChange={(event) => setPart(index, { unitCost: event.target.value })} placeholder="0" className={inputClass} /></FormField></div></div>)}</div>}
        </SectionCard>

        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 py-3 backdrop-blur-sm"><Button type="button" variant="outline" onClick={() => setLocation("/maintenance")}>إلغاء</Button><Button type="button" onClick={handleSubmit} disabled={!canSave || mutations.create.isPending}>{mutations.create.isPending ? "جارٍ الحفظ" : "حفظ السجل"}</Button></div>
      </div>
    </div>
  );
}
