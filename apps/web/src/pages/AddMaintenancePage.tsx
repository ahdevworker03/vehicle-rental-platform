import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Car, Search, Check } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { FormField, inputClass } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import { MAINTENANCE_TYPE_OPTIONS } from "@/lib/labels";
import { MOCK_TODAY, MOCK_TODAY_STR, toISO } from "@/lib/mock-date";
import { useTimeout } from "@/hooks/useTimeout";
import { useMaintenance } from "@/features/maintenance/hooks";
import { useVehicles } from "@/features/vehicles/hooks";
import type { MaintenanceRecord, MaintenanceType } from "@/data/types";

export default function AddMaintenancePage() {
  const [, setLocation] = useLocation();

  // Pre-select vehicle from query param (?vehicle=v1)
  const preVehicle = new URLSearchParams(window.location.search).get("vehicle") ?? "";

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedVehicleId, setSelectedVehicleId] = useState(preVehicle);
  const [showVehiclePicker, setShowVehiclePicker] = useState(!preVehicle);
  const [vehicleSearch, setVehicleSearch] = useState("");

  const [type, setType] = useState<MaintenanceType | "">("");
  const [dueDate, setDueDate] = useState(MOCK_TODAY_STR);
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  // Redirect after save, cleaned up if the user navigates away first
  useTimeout(() => setLocation("/maintenance"), saved ? 1200 : null);

  const maintenance = useMaintenance();
  const vehicles = useVehicles();

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const canSave = !!selectedVehicleId && !!type;

  function clearError(key: string) {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        `${v.make} ${v.model}`.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q)
    );
  }, [vehicleSearch]);

  // ── Validation ────────────────────────────────────────────────────────────
  function validate() {
    const errs: Record<string, string> = {};
    if (!selectedVehicleId) errs.vehicle = "اختر سيارة";
    if (!type) errs.type = "اختر نوع الصيانة";
    if (!dueDate) errs.dueDate = "أدخل التاريخ";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!validate()) return;

    const dueISO = toISO(dueDate);
    const dueMoment = new Date(dueISO);

    // Determine status: if due date is in the past → overdue, else upcoming
    const status: MaintenanceRecord["status"] =
      dueMoment < MOCK_TODAY ? "overdue" : "upcoming";

    const newRecord: MaintenanceRecord = {
      id: `m-${Date.now()}`,
      vehicleId: selectedVehicleId,
      type: type as MaintenanceType,
      dueDate: dueISO,
      cost: cost ? parseInt(cost.replace(/,/g, ""), 10) : undefined,
      notes: notes.trim() || undefined,
      status,
    };

    maintenance.push(newRecord);
    setSaved(true);
  }

  // ── Render ────────────────────────────────────────────────────────────────
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
            <p>{selectedVehicle.plate}</p>
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
                    {selectedVehicle.plate}
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

              {filteredVehicles.length === 0 ? (
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
                      <div className="text-xs text-muted-foreground">{v.plate}</div>
                    </div>
                    <div className="w-12 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {v.photos.length > 0 ? (
                        <img
                          src={v.photos[0]}
                          alt={`${v.make} ${v.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                        </div>
                      )}
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

        {/* ── 3. Date + Cost ────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="تاريخ الاستحقاق" required error={errors.dueDate}>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); clearError("dueDate"); }}
                className={errors.dueDate ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              />
            </FormField>

            <FormField label="التكلفة المتوقعة" hint="اختياري · بالدولار">
              <input
                type="number"
                inputMode="numeric"
                placeholder="مثال: 500000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>
        </div>

        {/* ── 4. Notes ──────────────────────────────────────────────── */}
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
          onClick={handleSave}
          disabled={!canSave}
          className={cn(
            "w-full rounded-2xl py-4 text-base font-bold transition-all shadow-sm",
            canSave
              ? "bg-primary text-primary-foreground active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          حفظ السجل
        </button>
      </div>
    </>
  );
}
