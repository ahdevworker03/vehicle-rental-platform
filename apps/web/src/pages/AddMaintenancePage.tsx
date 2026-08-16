import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Car, Search, Check, Plus, X } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { FormField, inputClass } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { MAINTENANCE_TYPE_OPTIONS } from "@/lib/labels";
import { getApiErrorMessage } from "@/lib/api-error";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useListVehicles } from "@workspace/api-client-react";
import type { CreateMaintenanceRequestType, MaintenanceReplacedPart } from "@workspace/api-client-react";
import { useMaintenanceMutations } from "@/features/maintenance/hooks";

interface PartDraft {
  name: string;
  brand: string;
  quantity: string;
  unitCost: string;
}

const EMPTY_PART: PartDraft = { name: "", brand: "", quantity: "", unitCost: "" };

function toISO(dateStr: string): string {
  return new Date(dateStr + "T12:00:00Z").toISOString();
}

export default function AddMaintenancePage() {
  const [, setLocation] = useLocation();
  const mutations = useMaintenanceMutations();

  // Pre-select vehicle from query param (?vehicle=v1)
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

  const { data: vehiclesData, isLoading: vehiclesLoading } = useListVehicles();
  const vehicles = useMemo(() => vehiclesData?.data ?? [], [vehiclesData]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const filteredVehicles = useMemo(() => {
    const q = debouncedVehicleSearch.toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        `${v.make} ${v.model}`.toLowerCase().includes(q) ||
        v.plateNumber.toLowerCase().includes(q),
    );
  }, [debouncedVehicleSearch, vehicles]);

  function clearError(key: string) {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!selectedVehicleId) errs.vehicle = "اختر سيارة";
    if (!type) errs.type = "اختر نوع الصيانة";
    if (!maintenanceDate) errs.maintenanceDate = "أدخل تاريخ الصيانة";
    if (cost && (Number(cost) < 0 || isNaN(Number(cost)))) {
      errs.cost = "أدخل تكلفة غير سالبة";
    }
    parts.forEach((part, i) => {
      if (!part.name.trim()) {
        errs[`part-${i}`] = "اسم القطعة مطلوب";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function setPart(index: number, patch: Partial<PartDraft>) {
    setParts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );
  }

  function addPart() {
    setParts((prev) => [...prev, { ...EMPTY_PART }]);
  }

  function removePart(index: number) {
    setParts((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (mutations.create.isPending) return;
    if (!validate()) return;

    setFormError(null);

    const replacedParts: MaintenanceReplacedPart[] | undefined = parts
      .filter((p) => p.name.trim())
      .map((p) => ({
        name: p.name.trim(),
        ...(p.brand.trim() ? { brand: p.brand.trim() } : {}),
        ...(p.quantity.trim()
          ? { quantity: Math.max(1, parseInt(p.quantity, 10)) }
          : {}),
        ...(p.unitCost.trim()
          ? { unitCost: Math.max(0, Number(p.unitCost)) }
          : {}),
      }));

    try {
      await mutations.create.mutateAsync({
        data: {
          vehicle_id: selectedVehicleId,
          type: type as CreateMaintenanceRequestType,
          maintenance_date: toISO(maintenanceDate),
          ...(vendor.trim() ? { vendor: vendor.trim() } : {}),
          ...(cost ? { cost: Number(cost) } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
          ...(replacedParts && replacedParts.length > 0
            ? { replaced_parts: replacedParts }
            : {}),
        },
      });
      setSaved(true);
      setTimeout(() => setLocation("/maintenance"), 1200);
    } catch (err) {
      setFormError(getApiErrorMessage(err).title);
    }
  }

  const isSubmitting = mutations.create.isPending;

  if (saved) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 gap-3">
        <div className="w-20 h-20 rounded-full bg-[hsl(var(--status-available-bg))] flex items-center justify-center">
          <Check className="w-10 h-10 text-[hsl(var(--status-available))]" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-foreground">تم تسجيل الصيانة</h2>
        {selectedVehicle && (
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>{selectedVehicle.make} {selectedVehicle.model}</p>
            <p>{selectedVehicle.plateNumber}</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground pt-2">
          جاري العودة إلى قائمة الصيانة...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="تسجيل صيانة"
        showBack
        onBack={() => setLocation("/maintenance")}
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-4">
        {formError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        {/* ── 1. Vehicle picker ─────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowVehiclePicker((v) => !v)}
            aria-expanded={showVehiclePicker}
            className="w-full flex items-center justify-between p-4"
          >
            <ChevronRight
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                showVehiclePicker ? "-rotate-90" : ""
              }`}
              strokeWidth={2}
            />
            <div className="flex items-center gap-3 flex-1 justify-end">
              {selectedVehicle ? (
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedVehicle.plateNumber}
                  </div>
                </div>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">
                  اختر السيارة
                  <span className="text-destructive mr-1">*</span>
                </span>
              )}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
            </div>
          </button>

          {errors.vehicle && (
            <p className="text-xs text-destructive px-4 pb-2 text-right">{errors.vehicle}</p>
          )}

          {showVehiclePicker && (
            <div className="border-t border-border px-4 pt-3 pb-4 space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  type="search"
                  placeholder="ابحث..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="w-full bg-muted rounded-xl pr-9 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border-none"
                />
              </div>

              {vehiclesLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner className="size-5" />
                </div>
              ) : filteredVehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">لا توجد نتائج</p>
              ) : (
                filteredVehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVehicleId(v.id);
                      setShowVehiclePicker(false);
                      clearError("vehicle");
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedVehicleId === v.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="text-right flex-1">
                      <div className="text-sm font-bold text-foreground">
                        {v.make} {v.model}
                      </div>
                      <div className="text-xs text-muted-foreground">{v.plateNumber}</div>
                    </div>
                    {selectedVehicleId === v.id && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── 2. Maintenance type ───────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4">
          <label className="text-sm font-semibold text-foreground block mb-3 text-right">
            نوع الصيانة
            <span className="text-destructive mr-1">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MAINTENANCE_TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = type === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { setType(opt.value); clearError("type"); }}
                  className={`flex items-center justify-end gap-2 p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {opt.label}
                  </span>
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                </button>
              );
            })}
          </div>
          {errors.type && (
            <p className="text-xs text-destructive mt-2 text-right">{errors.type}</p>
          )}
        </div>

        {/* ── 3. Date + Cost + Vendor ──────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="تاريخ الصيانة" required error={errors.maintenanceDate}>
              <input
                type="date"
                value={maintenanceDate}
                onChange={(e) => { setMaintenanceDate(e.target.value); clearError("maintenanceDate"); }}
                className={errors.maintenanceDate ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              />
            </FormField>

            <FormField label="التكلفة المتوقعة" hint="اختياري · تُحسم عند الإنجاز" error={errors.cost}>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="مثال: 150"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className={errors.cost ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              />
            </FormField>
          </div>

          <FormField label="الورشة / المزوّد" hint="اختياري">
            <input
              className={inputClass}
              placeholder="اسم ورشة الصيانة"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
            />
          </FormField>
        </div>

        {/* ── 4. Replaced parts ─────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">القطع المبدلة</h3>
            <button
              type="button"
              onClick={addPart}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              إضافة قطعة
            </button>
          </div>

          {parts.length === 0 && (
            <p className="text-xs text-muted-foreground">لا توجد قطع مبدلة — اختياري</p>
          )}

          {parts.map((part, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">قطعة {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removePart(i)}
                  aria-label="حذف القطعة"
                  className="text-destructive"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
              <FormField label="الاسم" required error={errors[`part-${i}`]}>
                <input
                  className={errors[`part-${i}`] ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                  placeholder="مثال: بواجي"
                  value={part.name}
                  onChange={(e) => { setPart(i, { name: e.target.value }); clearError(`part-${i}`); }}
                />
              </FormField>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <FormField label="الماركة" hint="اختياري">
                  <input
                    className={inputClass}
                    placeholder="مثال: Bosch"
                    value={part.brand}
                    onChange={(e) => setPart(i, { brand: e.target.value })}
                  />
                </FormField>
                <FormField label="الكمية" hint="اختياري">
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    min={1}
                    placeholder="1"
                    value={part.quantity}
                    onChange={(e) => setPart(i, { quantity: e.target.value })}
                  />
                </FormField>
                <FormField label="سعر الوحدة" hint="اختياري">
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    min={0}
                    placeholder="0"
                    value={part.unitCost}
                    onChange={(e) => setPart(i, { unitCost: e.target.value })}
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>

        {/* ── 5. Notes ──────────────────────────────────────────────── */}
        <FormField label="ملاحظات" hint="اختياري">
          <textarea
            placeholder="أي تفاصيل إضافية..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </FormField>

        {/* ── Save ──────────────────────────────────────────────────── */}
        <button
          onClick={handleSubmit}
          disabled={!selectedVehicleId || !type || !maintenanceDate || isSubmitting}
          className={cn(
            "w-full rounded-2xl py-4 text-base font-bold transition-all shadow-sm flex items-center justify-center gap-2",
            selectedVehicleId && type && maintenanceDate && !isSubmitting
              ? "bg-primary text-primary-foreground active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isSubmitting ? <Spinner /> : "حفظ السجل"}
        </button>
      </div>
    </>
  );
}
