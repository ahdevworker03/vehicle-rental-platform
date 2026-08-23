import { AppFrame } from "./_shared/AppFrame";
import { RentalFormContent } from "./_shared/RentalFormContent";
import { ArrowRight } from "lucide-react";

export function CreateRentalFormMobile() {
  return <AppFrame variant="mobile" active="rentals"><div className="flex items-center border-b border-[var(--ro-border)] bg-[var(--ro-surface)] px-4 py-2.5"><button className="-ms-2 inline-flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-bold text-[var(--ro-primary)] hover:bg-[var(--ro-primary-soft)]"><ArrowRight className="h-4 w-4 shrink-0"/>إنشاء إيجار جديد</button></div><RentalFormContent mobile /></AppFrame>;
}