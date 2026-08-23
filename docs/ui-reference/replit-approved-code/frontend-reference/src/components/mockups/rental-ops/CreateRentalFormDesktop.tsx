import { AppFrame } from "./_shared/AppFrame";
import { PageHeader } from "./_shared/PageHeader";
import { ArrowRight } from "lucide-react";
import { RentalFormContent } from "./_shared/RentalFormContent";

export function CreateRentalFormDesktop() {
  return <AppFrame variant="desktop" active="rentals"><PageHeader title="الإيجارات" description="إدارة عقود الإيجار والحجوزات الحالية" secondary={<button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ro-border)] px-4 text-sm font-semibold text-[var(--ro-text)] hover:bg-[var(--ro-bg)]"><ArrowRight className="h-4 w-4 shrink-0"/>العودة إلى الإيجارات</button>} /><RentalFormContent /></AppFrame>;
}