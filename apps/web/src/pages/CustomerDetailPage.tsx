import { useLocation } from "wouter";
import { Phone, MapPin, Car, Calendar, AlertCircle, ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { InfoRow } from "@/components/ui/InfoRow";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DocumentList } from "@/components/ui/DocumentList";
import { formatCurrency, formatDateAr, formatInitials } from "@/lib/format";
import { useAuth } from "@/providers/AuthProvider";
import { useCustomerDocuments } from "@/features/media/hooks";
import { useCustomer } from "@/features/customers/hooks";
import { useRentalsForCustomer, useTotalRemaining } from "@/features/rentals/hooks";
import { useVehicle } from "@/features/vehicles/hooks";
import {
  getActiveRentals,
  getEndedRentals,
  getTotalPaid,
  getRemaining,
} from "@/features/rentals/selectors";

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [, setLocation] = useLocation();
  const getCustomerById = useCustomer;
  const getRentalsForCustomer = useRentalsForCustomer;
  const getVehicleById = useVehicle;
  const getTotalRemaining = useTotalRemaining;
  const customer = getCustomerById(params.id);
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const documents = useCustomerDocuments(params.id);

  async function handleUploadDocument(file: File, category: string) {
    await documents.upload.mutateAsync({
      customerId: params.id,
      data: {
        file,
        category: category as "REGISTRATION" | "INSURANCE" | "OTHER",
      },
    });
  }

  async function handleDeleteDocument(documentId: string) {
    await documents.remove.mutateAsync({ customerId: params.id, id: documentId });
  }

  async function handleDownloadDocument(doc: { id: string; originalFilename: string }) {
    const blob = await documents.download(doc.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.originalFilename || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (!customer) {
    return (
      <div className="min-h-full">
        <PageHeader title="العميل غير موجود" showBack />
        <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-muted-foreground text-sm">لم يتم العثور على هذا العميل</p>
          <button
            onClick={() => setLocation("/customers")}
            className="text-primary font-medium text-sm active:opacity-70"
          >
            العودة إلى العملاء
          </button>
        </div>
      </div>
    );
  }

  const allRentals = getRentalsForCustomer(customer.id);
  const activeRentals = getActiveRentals(allRentals);
  const pastRentals = getEndedRentals(allRentals).sort(
    (a, b) => new Date(b.returnDate!).getTime() - new Date(a.returnDate!).getTime()
  );

  const totalPaidAllTime = allRentals.reduce((sum, r) => sum + getTotalPaid(r), 0);
  const totalRemainingActive = activeRentals.reduce((sum, r) => sum + getRemaining(r), 0);

  return (
    <div className="min-h-full pb-6">
      <PageHeader
        title={customer.name}
        showBack
        action={
          <button
            onClick={() => setLocation(`/customers/add?edit=${customer.id}`)}
            className="text-sm font-semibold text-primary px-3 py-1.5 rounded-lg active:bg-muted/50 transition-colors"
          >
            تعديل
          </button>
        }
      />

      <div className="px-4 pt-5 space-y-5">

        {/* ── Contact Card ─────────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm overflow-hidden">
          {/* Avatar + name header */}
          <div className="flex items-center gap-4 px-4 py-5 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
              {formatInitials(customer.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-foreground">{customer.name}</div>
              {customer.location && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{customer.location}</span>
                </div>
              )}
            </div>
            {/* Call button — visual prototype */}
            <a
              href={`tel:${customer.phone}`}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))] active:scale-95 transition-transform flex-shrink-0"
              aria-label="اتصال"
              onClick={(e) => e.preventDefault()}
            >
              <Phone className="w-5 h-5" strokeWidth={1.75} />
            </a>
          </div>

          {/* Info rows */}
          <div className="px-4">
            <InfoRow label="رقم الهاتف" value={customer.phone} />
            {customer.location && (
              <InfoRow label="الموقع" value={customer.location} />
            )}
            {customer.notes && (
              <InfoRow label="ملاحظات" value={customer.notes} />
            )}
          </div>
        </div>

        {/* ── Payment Summary ───────────────────────────────────────────── */}
        {allRentals.length > 0 && (
          <div className="bg-card rounded-2xl border border-card-border shadow-sm px-4 py-1">
            <InfoRow
              label="إجمالي المدفوع"
              value={
                <span className="text-[hsl(var(--status-available))] font-bold">
                  {formatCurrency(totalPaidAllTime)}
                </span>
              }
            />
            <InfoRow
              label="الرصيد المتبقي"
              value={
                totalRemainingActive > 0 ? (
                  <span className="text-[hsl(var(--status-danger))] font-bold">
                    {formatCurrency(totalRemainingActive)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">لا يوجد</span>
                )
              }
            />
          </div>
        )}

        {/* ── Documents ────────────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4">
          <DocumentList
            documents={documents.query.data?.data ?? []}
            isLoading={documents.query.isLoading}
            isError={documents.query.isError}
            error={documents.query.error}
            isOwner={isOwner}
            uploading={documents.upload.isPending}
            deleting={documents.remove.isPending}
            onUpload={handleUploadDocument}
            onDelete={handleDeleteDocument}
            onDownload={handleDownloadDocument}
          />
        </div>

        {/* ── Active Rentals ────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="الإيجارات الحالية" />
          {activeRentals.length === 0 ? (
            <div className="bg-card rounded-2xl border border-card-border shadow-sm px-4 py-6">
              <p className="text-sm text-muted-foreground text-center">لا توجد إيجارات حالية</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRentals.map((rental) => {
                const vehicle = getVehicleById(rental.vehicleIds[0]);
                const remaining = getTotalRemaining(rental.id);

                return (
                  <div
                    key={rental.id}
                    onClick={() => setLocation(`/rentals/${rental.id}`)}
                    className="bg-card rounded-2xl border border-[hsl(var(--status-rented-bg))] shadow-sm p-4 cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    {/* Vehicle + chevron */}
                    <div className="flex items-start justify-between mb-3">
                      <ChevronLeft className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">
                          {vehicle
                            ? `${vehicle.make} ${vehicle.model}`
                            : "سيارة غير معروفة"}
                        </div>
                        {vehicle && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {vehicle.plate}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date range */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>
                        {formatDateAr(rental.startDate)} — {formatDateAr(rental.endDate)}
                      </span>
                    </div>

                    {/* Financial summary */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span
                        className={
                          remaining > 0
                            ? "text-sm font-bold text-[hsl(var(--status-danger))]"
                            : "text-sm font-bold text-[hsl(var(--status-available))]"
                        }
                      >
                        {remaining > 0
                          ? `${formatCurrency(remaining)} متبقي`
                          : "مدفوع بالكامل"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        إجمالي {formatCurrency(rental.totalAmount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Rental History ────────────────────────────────────────────── */}
        <CollapsibleSection
          title="الإيجارات السابقة"
          count={pastRentals.length}
        >
          {pastRentals.length === 0 ? (
            <div className="px-4 py-5 text-sm text-muted-foreground text-center">
              لا توجد إيجارات سابقة
            </div>
          ) : (
            pastRentals.map((rental) => {
              const vehicle = getVehicleById(rental.vehicleIds[0]);
              return (
                <div
                  key={rental.id}
                  onClick={() => setLocation(`/rentals/${rental.id}`)}
                  className="flex items-start justify-between px-4 py-3.5 border-b border-border last:border-0 cursor-pointer active:bg-muted/50"
                >
                  <div className="text-left">
                    <div className="text-sm font-semibold text-foreground">
                      {formatCurrency(rental.totalAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {rental.returnDate ? formatDateAr(rental.returnDate) : "—"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {vehicle
                        ? `${vehicle.make} ${vehicle.model}`
                        : "سيارة غير معروفة"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatDateAr(rental.startDate)} — {formatDateAr(rental.endDate)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CollapsibleSection>

        {/* ── Action Button ─────────────────────────────────────────────── */}
        <button
          onClick={() => setLocation(`/rentals/new?customer=${customer.id}`)}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-base active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center justify-center gap-2">
            <Car className="w-5 h-5" strokeWidth={1.75} />
            تأجير سيارة
          </div>
        </button>

      </div>
    </div>
  );
}
