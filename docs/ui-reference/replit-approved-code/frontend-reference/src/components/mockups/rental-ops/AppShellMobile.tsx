import { AppFrame } from "./_shared/AppFrame";
import { Plus } from "lucide-react";

/** Mobile app shell (375–767px): compact top title + primary action, bottom nav + "المزيد" drawer for full module access. */
export function AppShellMobile() {
  return (
    <AppFrame variant="mobile" active="dashboard">
      <div className="flex items-center justify-between border-b border-[var(--ro-border)] bg-[var(--ro-surface)] px-4 py-3.5">
         <h1 className="text-lg font-bold text-[var(--ro-text)]">لوحة التحكم</h1>
         <button aria-label="إنشاء إيجار" className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ro-primary)] text-white">
           <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 p-6 text-center">
         <div className="text-base font-semibold text-[var(--ro-text-muted)]">تنقل جوال مضغوط</div>
         <p className="max-w-[240px] text-sm leading-7 text-[var(--ro-text-faint)]">
          أهم أربع وجهات في شريط سفلي دائم، وزر "المزيد" يفتح كل الوحدات دون سلسلة تنقل متعددة
          الخطوات. جرّب فتح "المزيد" في هذا الإطار.
        </p>
      </div>
    </AppFrame>
  );
}
