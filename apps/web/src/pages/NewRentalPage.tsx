import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Car, User, ChevronRight, Check, Search, X, AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { FormField, inputClass } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTimeout } from "@/hooks/useTimeout";
import {
  useListVehicles,
  useListCustomers,
  useCreateRental,
  useCheckRentalAvailability,
  getListRentalsQueryKey,
  getListVehiclesQueryKey,
  getCheckRentalAvailabilityQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api-error";
import type { VehicleResponse } from "@workspace/api-client-react";

function toDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function calcDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function NewRentalPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const params = new URLSearchParams(window.location.search);
  const preVehicle = params.get("vehicle") ?? "";
  const preCustomer = params.get("customer") ?? "";

  const [selectedVehicleId, setSelectedVehicleId] = useState(preVehicle);
  const [selectedCustomerId, setSelectedCustomerId] = useState(preCustomer);

  const [vehicleSearch, setVehicleSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const [showVehiclePicker, setShowVehiclePicker] = useState(!preVehicle);
  const [showCustomerPicker, setShowCustomerPicker] = useState(!!preVehicle && !preCustomer);

  const [pickupDate, setPickupDate] = useState(toDateInput(new Date()));
  const [returnDate, setReturnDate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useTimeout(() => setLocation("/rentals"), saved ? 1200 : null);

  const { data: vehiclesData, isLoading: vehiclesLoading } = useListVehicles();
  const { data: customersData, isLoading: customersLoading } = useListCustomers();

  const createMutation = useCreateRental({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListRentalsQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
      },
    },
  });

  const vehicles = useMemo(() => vehiclesData?.data ?? [], [vehiclesData]);
  const customers = useMemo(() => customersData?.data ?? [], [customersData]);

  const availabilityParams = useMemo(() => {
    if (!pickupDate || !returnDate || returnDate <= pickupDate) return null;
    return {
      vehicleId: selectedVehicleId || "x",
      pickupDate: new Date(`${pickupDate}T09:00:00Z`).toISOString(),
      expectedReturnDate: new Date(`${returnDate}T09:00:00Z`).toISOString(),
    };
  }, [pickupDate, returnDate, selectedVehicleId]);

  const availabilityQueryKey = availabilityParams
    ? getCheckRentalAvailabilityQueryKey(availabilityParams)
    : [];

  const { data: availabilityData } = useCheckRentalAvailability(
    availabilityParams ?? { vehicleId: "x", pickupDate: "", expectedReturnDate: "" },
    {
      query: {
        enabled: Boolean(availabilityParams),
        queryKey: availabilityQueryKey,
      },
    },
  );

  const periodSet = Boolean(pickupDate && returnDate && returnDate > pickupDate);

  const availableVehicles = useMemo(() => {
    if (!periodSet) return vehicles;
    return vehicles.filter((v) => v.status === "AVAILABLE");
  }, [vehicles, periodSet]);

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.trim().toLowerCase();
    if (!q) return availableVehicles;
    return availableVehicles.filter(
      (v) =>
        `${v.make} ${v.model}`.toLowerCase().includes(q) ||
        v.plateNumber.toLowerCase().includes(q)
    );
  }, [availableVehicles, vehicleSearch]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const days = calcDays(pickupDate, returnDate);
  const rate = parseFloat(dailyRate.replace(/,/g, "")) || 0;
  const deposit = parseFloat(depositAmount.replace(/,/g, "")) || 0;
  const total = days * rate;

  const availabilityAvailable = availabilityData?.data?.available ?? true;

  const canSave =
    !!selectedVehicleId &&
    !!selectedCustomerId &&
    !!pickupDate &&
    !!returnDate &&
    returnDate > pickupDate &&
    rate > 0;

  const stepVehicleDone = !!selectedVehicleId;
  const stepCustomerDone = !!selectedCustomerId;
  const currentStepIdx = !stepVehicleDone ? 0 : !stepCustomerDone ? 1 : 2;

  function clearError(key: string) {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  const STEPS = [
    { key: "vehicle", label: "السيارة" },
    { key: "customer", label: "العميل" },
    { key: "details", label: "التفاصيل" },
  ];

  function stepState(idx: number): "done" | "current" | "future" {
    if (idx < currentStepIdx) return "done";
    if (idx === currentStepIdx) return "current";
    return "future";
  }

  function selectVehicle(id: string) {
    const v = vehicles.find((v) => v.id === id);
    setSelectedVehicleId(id);
    setShowVehiclePicker(false);
    if (!selectedCustomerId) setShowCustomerPicker(true);
    void v;
  }

  function selectCustomer(id: string) {
    setSelectedCustomerId(id);
    setShowCustomerPicker(false);
  }

  function removeVehicle() {
    setSelectedVehicleId("");
    setShowVehiclePicker(true);
    setVehicleSearch("");
  }

  function removeCustomer() {
    setSelectedCustomerId("");
    setShowCustomerPicker(true);
    setCustomerSearch("");
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!selectedVehicleId) errs.vehicle = "اختر سيارة";
    if (!selectedCustomerId) errs.customer = "اختر عميلاً";
    if (!pickupDate) errs.pickupDate = "أدخل تاريخ الاستلام";
    if (!returnDate) errs.returnDate = "أدخل تاريخ الإرجاع";
    if (returnDate && pickupDate && returnDate <= pickupDate)
      errs.returnDate = "تاريخ الإرجاع يجب أن يكون بعد تاريخ الاستلام";
    if (!dailyRate || rate <= 0) errs.dailyRate = "أدخل الأجرة اليومية";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (createMutation.isPending) return;
    if (!validate()) return;

    setFormError(null);

    try {
      await createMutation.mutateAsync({
        data: {
          customer_id: selectedCustomerId,
          vehicle_id: selectedVehicleId,
          pickup_date: new Date(`${pickupDate}T09:00:00Z`).toISOString(),
          expected_return_date: new Date(`${returnDate}T09:00:00Z`).toISOString(),
          daily_rate: rate,
          total_amount: total,
          deposit_amount: deposit,
        },
      });
      setSaved(true);
    } catch (err) {
      setFormError(getApiErrorMessage(err).title);
    }
  }

  if (saved) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 gap-3">
        <div className="w-20 h-20 rounded-full bg-[hsl(var(--status-available-bg))] flex items-center justify-center">
          <Check className="w-10 h-10 text-[hsl(var(--status-available))]" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-foreground">تم إنشاء عقد الإيجار</h2>
        <div className="text-center text-sm text-muted-foreground space-y-1">
          {selectedVehicle && (
            <p>{selectedVehicle.make} {selectedVehicle.model}</p>
          )}
          {selectedCustomer && (
            <p>العميل: {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          جاري العودة إلى قائمة الإيجارات...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="تأجير جديد"
        showBack
        onBack={() => setLocation("/rentals")}
      />

      {/* Step Progress */}
      <div className="flex items-start justify-center gap-0 px-6 pt-3 pb-1">
        {STEPS.map((step, idx) => {
          const state = stepState(idx);
          const isLast = idx === STEPS.length - 1;
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    state === "done" && "bg-[hsl(var(--status-available))] text-white",
                    state === "current" && "bg-primary text-primary-foreground ring-2 ring-primary/20",
                    state === "future" && "bg-muted text-muted-foreground"
                  )}
                >
                  {state === "done" ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    state === "future" ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-[2px] mx-2 mb-5 rounded-full",
                    state === "done" ? "bg-[hsl(var(--status-available))]" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-8 space-y-4">
        {formError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
            <span>{formError}</span>
          </div>
        )}

        {/* 1. Vehicle picker */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm overflow-hidden">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVehiclePicker((v) => !v)}
              aria-expanded={showVehiclePicker}
              aria-label="اختيار السيارة"
              className="absolute inset-0 w-full rounded-2xl"
            />
            <div className="w-full flex items-center justify-between p-4 pointer-events-none">
              <ChevronRight
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  showVehiclePicker ? "-rotate-90" : ""
                }`}
                strokeWidth={2}
              />
              <div className="flex items-center gap-3 flex-1 justify-end">
                {selectedVehicle ? (
                  <>
                    <button
                      type="button"
                      onClick={removeVehicle}
                      className="pointer-events-auto relative w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-90 transition-all flex-shrink-0"
                      aria-label="إلغاء اختيار السيارة"
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground">
                        {selectedVehicle.make} {selectedVehicle.model}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {selectedVehicle.plateNumber}
                      </div>
                    </div>
                  </>
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
            </div>
          </div>

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
                <div className="flex items-center justify-center py-6">
                  <Spinner />
                </div>
              ) : availableVehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {periodSet
                    ? "لا توجد سيارات متاحة في هذه الفترة"
                    : "حدّد فترة الإيجار أولاً لعرض السيارات المتاحة"}
                </p>
              ) : filteredVehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">لا توجد نتائج</p>
              ) : (
                filteredVehicles.map((v: VehicleResponse) => (
                  <button
                    key={v.id}
                    onClick={() => selectVehicle(v.id)}
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

        {/* 2. Customer picker */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm overflow-hidden">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCustomerPicker((v) => !v)}
              aria-expanded={showCustomerPicker}
              aria-label="اختيار العميل"
              className="absolute inset-0 w-full rounded-2xl"
            />
            <div className="w-full flex items-center justify-between p-4 pointer-events-none">
              <ChevronRight
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  showCustomerPicker ? "-rotate-90" : ""
                }`}
                strokeWidth={2}
              />
              <div className="flex items-center gap-3 flex-1 justify-end">
                {selectedCustomer ? (
                  <>
                    <button
                      type="button"
                      onClick={removeCustomer}
                      className="pointer-events-auto relative w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-90 transition-all flex-shrink-0"
                      aria-label="إلغاء اختيار العميل"
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {selectedCustomer.phone}
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">
                    اختر العميل
                    <span className="text-destructive mr-1">*</span>
                  </span>
                )}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>

          {errors.customer && (
            <p className="text-xs text-destructive px-4 pb-2 text-right">{errors.customer}</p>
          )}

          {showCustomerPicker && (
            <div className="border-t border-border px-4 pt-3 pb-4 space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  type="search"
                  placeholder="ابحث بالاسم أو الهاتف..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-muted rounded-xl pr-9 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border-none"
                />
              </div>

              {customersLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner />
                </div>
              ) : filteredCustomers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">لا توجد نتائج</p>
              ) : (
                filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectCustomer(c.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedCustomerId === c.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="text-right flex-1">
                      <div className="text-sm font-bold text-foreground">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-xs">
                      {`${c.firstName[0] ?? ""}${c.lastName[0] ?? ""}`}
                    </div>
                    {selectedCustomerId === c.id && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* 3. Rental details */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="تاريخ الاستلام" required error={errors.pickupDate}>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => { setPickupDate(e.target.value); clearError("pickupDate"); }}
                className={errors.pickupDate ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              />
            </FormField>

            <FormField label="تاريخ الإرجاع" required error={errors.returnDate}>
              <input
                type="date"
                value={returnDate}
                min={pickupDate}
                onChange={(e) => { setReturnDate(e.target.value); clearError("returnDate"); }}
                className={errors.returnDate ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="الأجرة اليومية" required hint="بالدولار" error={errors.dailyRate}>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={dailyRate}
                onChange={(e) => { setDailyRate(e.target.value); clearError("dailyRate"); }}
                className={errors.dailyRate ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              />
            </FormField>

            <FormField label="التأمين" hint="بالدولار">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>

          {/* Availability warning */}
          {periodSet && selectedVehicleId && availabilityData && (
            <div
              className={cn(
                "rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2",
                availabilityAvailable
                  ? "bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))]"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              <span>
                {availabilityAvailable
                  ? "السيارة متاحة في هذه الفترة"
                  : "السيارة غير متاحة في هذه الفترة"}
              </span>
            </div>
          )}

          {/* Rental Summary */}
          {days > 0 && rate > 0 && selectedVehicle && selectedCustomer && (
            <div className="border-t border-border pt-4 mt-2 space-y-3">
              <h3 className="text-sm font-bold text-foreground">ملخص الإيجار</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">السيارة</span>
                  <span className="font-semibold text-foreground">{selectedVehicle.make} {selectedVehicle.model}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">العميل</span>
                  <span className="font-semibold text-foreground">{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المدة</span>
                  <span className="font-semibold text-foreground">{pickupDate} → {returnDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الأجرة اليومية</span>
                  <span className="font-semibold text-foreground">{formatCurrency(rate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">عدد الأيام</span>
                  <span className="font-semibold text-foreground">{days}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">الإجمالي</span>
                    <span className="text-lg font-bold text-foreground">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!canSave || createMutation.isPending}
          className={cn(
            "w-full rounded-2xl py-4 text-base font-bold transition-all shadow-sm flex items-center justify-center gap-2",
            canSave && !createMutation.isPending
              ? "bg-primary text-primary-foreground active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {createMutation.isPending ? <Spinner /> : "حفظ الإيجار"}
        </button>
      </div>
    </>
  );
}
