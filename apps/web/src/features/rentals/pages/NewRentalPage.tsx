import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Car, Check, ChevronDown, Search, User, X, Plus } from "lucide-react";
import type {
  CustomerResponse,
  VehicleResponse,
} from "@workspace/api-client-react";
import {
  getCheckRentalAvailabilityQueryKey,
  getListRentalsQueryKey,
  getListVehiclesQueryKey,
  useCheckRentalAvailability,
  useCreateRental,
  useListCustomers,
  useListVehicles,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  InfoBanner,
  InlineError,
  LoadingState,
} from "@/components/ui/FeedbackState";
import { FormField, inputClass } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useTimeout } from "@/hooks/useTimeout";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

function toDateInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toDateTime(date: string, time: string): Date | null {
  if (!date || !time) return null;
  const value = new Date(`${date}T${time}:00Z`);
  return Number.isNaN(value.getTime()) ? null : value;
}

function calcDays(start: Date | null, end: Date | null): number {
  if (!start || !end) return 0;
  const difference = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(difference / (24 * 60 * 60 * 1000)));
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
  const [showCustomerPicker, setShowCustomerPicker] = useState(
    !!preVehicle && !preCustomer,
  );
  const [pickupDate, setPickupDate] = useState(() => toDateInput(new Date()));
  const [pickupTime, setPickupTime] = useState("09:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("09:00");
  const [dailyRate, setDailyRate] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useTimeout(() => setLocation("/rentals"), saved ? 1200 : null);

  const vehiclesQuery = useListVehicles();
  const customersQuery = useListCustomers();
  const createMutation = useCreateRental({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getListRentalsQueryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: getListVehiclesQueryKey(),
        });
      },
    },
  });

  const vehicles = useMemo(
    () => vehiclesQuery.data?.data ?? [],
    [vehiclesQuery.data],
  );
  const customers = useMemo(
    () => customersQuery.data?.data ?? [],
    [customersQuery.data],
  );
  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId,
  );
  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  );
  const pickupDateTime = useMemo(
    () => toDateTime(pickupDate, pickupTime),
    [pickupDate, pickupTime],
  );
  const returnDateTime = useMemo(
    () => toDateTime(returnDate, returnTime),
    [returnDate, returnTime],
  );

  const availabilityParams = useMemo(() => {
    if (!pickupDateTime || !returnDateTime || returnDateTime <= pickupDateTime)
      return null;
    return {
      vehicleId: selectedVehicleId || "x",
      pickupDate: pickupDateTime.toISOString(),
      expectedReturnDate: returnDateTime.toISOString(),
    };
  }, [pickupDateTime, returnDateTime, selectedVehicleId]);

  const availabilityQuery = useCheckRentalAvailability(
    availabilityParams ?? {
      vehicleId: "x",
      pickupDate: "",
      expectedReturnDate: "",
    },
    {
      query: {
        enabled: Boolean(availabilityParams),
        queryKey: availabilityParams
          ? getCheckRentalAvailabilityQueryKey(availabilityParams)
          : [],
      },
    },
  );

  const periodSet = Boolean(
    pickupDateTime && returnDateTime && returnDateTime > pickupDateTime,
  );
  const availableVehicles = useMemo(
    () =>
      periodSet
        ? vehicles.filter((vehicle) => vehicle.status === "AVAILABLE")
        : vehicles,
    [periodSet, vehicles],
  );
  const filteredVehicles = useMemo(() => {
    const query = vehicleSearch.trim().toLowerCase();
    if (!query) return availableVehicles;
    return availableVehicles.filter(
      (vehicle) =>
        `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(query) ||
        vehicle.plateNumber.toLowerCase().includes(query),
    );
  }, [availableVehicles, vehicleSearch]);
  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter(
      (customer) =>
        `${customer.firstName} ${customer.lastName}`
          .toLowerCase()
          .includes(query) || customer.phone.toLowerCase().includes(query),
    );
  }, [customers, customerSearch]);

  const days = calcDays(pickupDateTime, returnDateTime);
  const rate = Number.parseFloat(dailyRate.replace(/,/g, "")) || 0;
  const deposit = Number.parseFloat(depositAmount.replace(/,/g, "")) || 0;
  const total = days * rate;
  const availabilityAvailable = availabilityQuery.data?.data?.available ?? true;
  const canSave = Boolean(
    selectedVehicleId &&
    selectedCustomerId &&
    pickupDateTime &&
    returnDateTime &&
    returnDateTime > pickupDateTime &&
    rate > 0,
  );

  function clearError(key: string) {
    if (!errors[key]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function selectVehicle(id: string) {
    setSelectedVehicleId(id);
    setShowVehiclePicker(false);
    if (!selectedCustomerId) setShowCustomerPicker(true);
    clearError("vehicle");
  }

  function selectCustomer(id: string) {
    setSelectedCustomerId(id);
    setShowCustomerPicker(false);
    clearError("customer");
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!selectedVehicleId) nextErrors.vehicle = "اختر مركبة.";
    if (!selectedCustomerId) nextErrors.customer = "اختر عميلاً.";
    if (!pickupDate) nextErrors.pickupDate = "أدخل تاريخ الاستلام.";
    if (!pickupTime) nextErrors.pickupTime = "أدخل وقت الاستلام.";
    if (!returnDate) nextErrors.returnDate = "أدخل تاريخ الإرجاع.";
    if (!returnTime) nextErrors.returnTime = "أدخل وقت الإرجاع المتوقع.";
    if (pickupDateTime && returnDateTime && returnDateTime <= pickupDateTime)
      nextErrors.returnDate =
        "موعد الإرجاع المتوقع يجب أن يكون بعد موعد الاستلام.";
    if (!dailyRate || rate <= 0) nextErrors.dailyRate = "أدخل الأجرة اليومية.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (createMutation.isPending || !validate()) return;
    setFormError(null);

    try {
      await createMutation.mutateAsync({
        data: {
          customer_id: selectedCustomerId,
          vehicle_id: selectedVehicleId,
          pickup_date: pickupDateTime!.toISOString(),
          expected_return_date: returnDateTime!.toISOString(),
          daily_rate: rate,
          total_amount: total,
          deposit_amount: deposit,
        },
      });
      setSaved(true);
    } catch (error) {
      setFormError(getApiErrorMessage(error).title);
    }
  }

  if (saved) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-xl bg-status-positive-bg text-status-positive">
          <Check className="size-8" aria-hidden="true" />
        </div>
        <h2 className="ui-page-title">تم إنشاء عقد الإيجار</h2>
        <p className="ui-secondary-text">
          {selectedCustomer && selectedVehicle
            ? `${selectedCustomer.firstName} ${selectedCustomer.lastName} · ${selectedVehicle.make} ${selectedVehicle.model}`
            : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          جاري العودة إلى قائمة الإيجارات...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <PageHeader
        title="إنشاء إيجار"
        showBack
        onBack={() => setLocation("/rentals")}
      />
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-4 lg:space-y-5">
          <div>
            <h2 className="ui-page-title">بيانات عقد الإيجار</h2>
            <p className="ui-secondary-text mt-1">
              اختر العميل والمركبة ثم حدّد فترة الإيجار والتسعير.
            </p>
          </div>

          {formError && (
            <InlineError className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              {formError}
            </InlineError>
          )}

          <FormSection
            title="العميل"
            description="ابحث عن العميل أو أضف عميلاً جديداً قبل إنشاء العقد."
            contentClassName="md:grid-cols-1"
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <FormField
                  label="البحث عن عميل"
                  htmlFor="customer-search"
                  className="flex-1"
                >
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="customer-search"
                      type="search"
                      value={customerSearch}
                      onChange={(event) => {
                        setCustomerSearch(event.target.value);
                        setShowCustomerPicker(true);
                      }}
                      placeholder="الاسم أو رقم الهاتف"
                      className={`${inputClass} ps-10`}
                    />
                  </div>
                </FormField>
                <div className="flex flex-col gap-1.5 sm:w-auto">
                  <span className="ui-label">عميل جديد</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/customers/add")}
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    إضافة عميل
                  </Button>
                </div>
              </div>
              <SelectionTrigger
                icon={User}
                label="العميل المحدد"
                value={
                  selectedCustomer
                    ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                    : "اختر عميلاً"
                }
                description={selectedCustomer?.phone ?? ""}
                expanded={showCustomerPicker}
                onToggle={() => setShowCustomerPicker((current) => !current)}
                onClear={
                  selectedCustomer
                    ? () => {
                        setSelectedCustomerId("");
                        setShowCustomerPicker(true);
                        setCustomerSearch("");
                      }
                    : undefined
                }
              />
              {errors.customer && <InlineError>{errors.customer}</InlineError>}
              {showCustomerPicker && (
                <CustomerOptions
                  loading={customersQuery.isLoading}
                  customers={filteredCustomers}
                  selectedId={selectedCustomerId}
                  onSelect={selectCustomer}
                />
              )}
            </div>
          </FormSection>

          <FormSection
            title="المركبة والتوافر"
            description="اختر المركبة المناسبة لفترة الإيجار المحددة."
            contentClassName="md:grid-cols-1"
          >
            <div className="space-y-4">
              <FormField label="البحث عن مركبة" htmlFor="vehicle-search">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    id="vehicle-search"
                    type="search"
                    value={vehicleSearch}
                    onChange={(event) => {
                      setVehicleSearch(event.target.value);
                      setShowVehiclePicker(true);
                    }}
                    placeholder="الشركة أو الطراز أو رقم اللوحة"
                    className={`${inputClass} ps-10`}
                  />
                </div>
              </FormField>
              <SelectionTrigger
                icon={Car}
                label="المركبة المحددة"
                value={
                  selectedVehicle
                    ? `${selectedVehicle.make} ${selectedVehicle.model}`
                    : "اختر مركبة"
                }
                description={selectedVehicle?.plateNumber ?? ""}
                valueDir="ltr"
                expanded={showVehiclePicker}
                onToggle={() => setShowVehiclePicker((current) => !current)}
                onClear={
                  selectedVehicle
                    ? () => {
                        setSelectedVehicleId("");
                        setShowVehiclePicker(true);
                        setVehicleSearch("");
                      }
                    : undefined
                }
              />
              {errors.vehicle && <InlineError>{errors.vehicle}</InlineError>}
              {showVehiclePicker && (
                <VehicleOptions
                  loading={vehiclesQuery.isLoading}
                  vehicles={filteredVehicles}
                  periodSet={periodSet}
                  selectedId={selectedVehicleId}
                  onSelect={selectVehicle}
                />
              )}
              {periodSet &&
                selectedVehicleId &&
                availabilityQuery.data &&
                (availabilityAvailable ? (
                  <InfoBanner icon={Check}>متاحة للفترة المحددة</InfoBanner>
                ) : (
                  <InlineError className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                    هذه المركبة غير متاحة في الفترة المحددة.
                  </InlineError>
                ))}
            </div>
          </FormSection>

          <FormSection
            title="فترة الإيجار"
            description="تُعرض مواعيد العقد بتنسيق اليوم-الشهر-السنة والوقت."
          >
            <DateField
              label="تاريخ الاستلام"
              id="pickup-date"
              value={pickupDate}
              error={errors.pickupDate}
              onChange={(value) => {
                setPickupDate(value);
                clearError("pickupDate");
              }}
            />
            <TimeField
              label="وقت الاستلام"
              id="pickup-time"
              value={pickupTime}
              error={errors.pickupTime}
              onChange={(value) => {
                setPickupTime(value);
                clearError("pickupTime");
              }}
            />
            <DateField
              label="تاريخ الإرجاع المتوقع"
              id="return-date"
              value={returnDate}
              min={pickupDate}
              error={errors.returnDate}
              onChange={(value) => {
                setReturnDate(value);
                clearError("returnDate");
              }}
            />
            <TimeField
              label="وقت الإرجاع المتوقع"
              id="return-time"
              value={returnTime}
              error={errors.returnTime}
              onChange={(value) => {
                setReturnTime(value);
                clearError("returnTime");
              }}
            />
          </FormSection>

          <FormSection
            title="التسعير والتأمين"
            description="حدّد الأجرة اليومية والتأمين قبل حفظ عقد الإيجار."
          >
            <FormField
              label="الأجرة اليومية"
              required
              hint="بالدولار الأمريكي"
              error={errors.dailyRate}
              htmlFor="daily-rate"
            >
              <input
                id="daily-rate"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={dailyRate}
                onChange={(event) => {
                  setDailyRate(event.target.value);
                  clearError("dailyRate");
                }}
                className={
                  errors.dailyRate
                    ? `${inputClass} border-destructive focus:ring-destructive/30`
                    : inputClass
                }
              />
            </FormField>
            <FormField
              label="مبلغ التأمين"
              hint="بالدولار الأمريكي"
              htmlFor="deposit-amount"
            >
              <input
                id="deposit-amount"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
                className={inputClass}
              />
            </FormField>
            <div className="rounded-lg bg-muted/45 p-4 md:col-span-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryValue
                  label="إجمالي الإيجار"
                  value={formatCurrency(total)}
                  prominent
                />
                <SummaryValue
                  label="الأجرة اليومية"
                  value={formatCurrency(rate)}
                />
                <SummaryValue
                  label="مبلغ التأمين"
                  value={formatCurrency(deposit)}
                />
                <SummaryValue
                  label="المدة"
                  value={`${days} ${days === 1 ? "يوم" : "أيام"}`}
                />
              </div>
              {selectedCustomer && selectedVehicle && days > 0 && rate > 0 && (
                <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </span>{" "}
                  ·{" "}
                  <span dir="ltr">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </span>
                </div>
              )}
            </div>
          </FormSection>
        </div>
      </div>
      <div className="border-t border-border bg-background px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/rentals")}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave || createMutation.isPending}
          >
            {createMutation.isPending ? "جارٍ الحفظ" : "حفظ الإيجار"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SelectionTrigger({
  icon: Icon,
  label,
  value,
  description,
  valueDir,
  expanded,
  onToggle,
  onClear,
}: {
  icon: typeof User;
  label: string;
  value: string;
  description: string;
  valueDir?: "ltr";
  expanded: boolean;
  onToggle: () => void;
  onClear?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <span className="min-w-0 text-right">
          <span className="block text-xs text-muted-foreground">{label}</span>
          <span
            className="mt-1 block truncate text-sm font-medium text-foreground"
            dir={valueDir ?? "auto"}
          >
            {value}
          </span>
          {description && (
            <span
              dir="ltr"
              className="number-ltr mt-0.5 block truncate text-right text-xs text-muted-foreground"
            >
              {description}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {onClear && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClear}
          aria-label={`إلغاء اختيار ${label}`}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

function CustomerOptions({
  loading,
  customers,
  selectedId,
  onSelect,
}: {
  loading: boolean;
  customers: CustomerResponse[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (loading)
    return (
      <LoadingState rows={3} className="rounded-lg border border-border" />
    );
  if (customers.length === 0)
    return (
      <InfoBanner>
        لا توجد نتائج للعملاء. جرّب البحث باسم مختلف أو أضف عميلاً جديداً.
      </InfoBanner>
    );
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {customers.map((customer) => (
        <button
          key={customer.id}
          type="button"
          onClick={() => onSelect(customer.id)}
          className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 text-start transition-colors hover:bg-muted/50"
          dir="rtl"
        >
          <span className="min-w-0 text-right">
            <span
              dir="auto"
              className="block truncate text-sm font-medium text-foreground"
            >
              {customer.firstName} {customer.lastName}
            </span>
            <span
              dir="ltr"
              className="number-ltr mt-0.5 block truncate text-right text-xs text-muted-foreground"
            >
              {customer.phone}
            </span>
          </span>
          {selectedId === customer.id && (
            <Check className="size-4 shrink-0 text-primary" aria-label="محدد" />
          )}
        </button>
      ))}
    </div>
  );
}

function VehicleOptions({
  loading,
  vehicles,
  periodSet,
  selectedId,
  onSelect,
}: {
  loading: boolean;
  vehicles: VehicleResponse[];
  periodSet: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (loading)
    return (
      <LoadingState rows={3} className="rounded-lg border border-border" />
    );
  if (vehicles.length === 0)
    return (
      <InfoBanner>
        {periodSet
          ? "لا توجد مركبات متاحة في هذه الفترة."
          : "حدّد فترة الإيجار لعرض المركبات المتاحة."}
      </InfoBanner>
    );
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {vehicles.map((vehicle) => (
        <button
          key={vehicle.id}
          type="button"
          onClick={() => onSelect(vehicle.id)}
          className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 text-start transition-colors hover:bg-muted/50"
          dir="rtl"
        >
          <span className="min-w-0 text-right">
            <span
              dir="auto"
              className="block truncate text-sm font-medium text-foreground"
            >
              {vehicle.make} {vehicle.model}
            </span>
            <span
              dir="ltr"
              className="number-ltr mt-0.5 block truncate text-right text-xs text-muted-foreground"
            >
              {vehicle.plateNumber}
            </span>
          </span>
          {selectedId === vehicle.id ? (
            <Check className="size-4 shrink-0 text-primary" aria-label="محدد" />
          ) : (
            <StatusBadge status={vehicle.status} />
          )}
        </button>
      ))}
    </div>
  );
}

function DateField({
  label,
  id,
  value,
  min,
  error,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  min?: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormField label={label} required error={error} htmlFor={id}>
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} number-ltr`}
        dir="ltr"
      />
    </FormField>
  );
}

function TimeField({
  label,
  id,
  value,
  error,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormField label={label} required error={error} htmlFor={id}>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} number-ltr`}
        dir="ltr"
      />
    </FormField>
  );
}

function SummaryValue({
  label,
  value,
  prominent = false,
}: {
  label: string;
  value: string;
  prominent?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 text-right">
      <div className="ui-label">{label}</div>
      <div
        dir="ltr"
        className={cn(
          "number-ltr whitespace-nowrap text-sm font-medium text-foreground",
          prominent && "text-base font-semibold",
        )}
      >
        {value}
      </div>
    </div>
  );
}
