import { AppFrame } from "./_shared/AppFrame";
import { PageHeader, PrimaryButton } from "./_shared/PageHeader";
import { Plus } from "lucide-react";

/** Tablet app shell (768–1023px): deliberate middle state — compact icon rail, not bottom tabs or full sidebar. */
export function AppShellTablet() {
  return (
    <AppFrame variant="tablet" active="dashboard">
      <PageHeader
        title="لوحة التحكم"
        primaryAction={
          <PrimaryButton>
            <Plus className="h-4 w-4" />
            إنشاء إيجار
          </PrimaryButton>
        }
      />
      <div className="flex h-[calc(100%-65px)] flex-col items-center justify-center gap-2 p-8 text-center">
         <div className="text-base font-semibold text-[var(--ro-text-muted)]">
          حالة تنقل متوسطة مخصصة للجهاز اللوحي
        </div>
         <p className="max-w-xs text-sm leading-7 text-[var(--ro-text-faint)]">
          سكة أيقونات مضغوطة مع تسميات مختصرة تبقي كل الوحدات في متناول اليد دون مزاحمة المحتوى،
          بدل التبديل المفاجئ بين شريط سفلي وشريط جانبي كامل.
        </p>
      </div>
    </AppFrame>
  );
}
