import { AppFrame } from "./_shared/AppFrame";
import { PageHeader, PrimaryButton } from "./_shared/PageHeader";
import { Plus } from "lucide-react";

/** Desktop app shell (≥1024px): persistent full sidebar + topbar context area. */
export function AppShellDesktop() {
  return (
    <AppFrame variant="desktop" active="dashboard">
      <PageHeader
        title="لوحة التحكم"
        description="نظرة عامة على العمليات اليومية لمكتب التأجير"
        primaryAction={
          <PrimaryButton>
            <Plus className="h-4 w-4" />
            إنشاء إيجار
          </PrimaryButton>
        }
      />
      <div className="flex h-[calc(100%-73px)] flex-col items-center justify-center gap-2 p-10 text-center">
         <div className="text-base font-semibold text-[var(--ro-text-muted)]">
          هيكل التنقل الكامل لسطح المكتب
        </div>
         <p className="max-w-md text-sm leading-7 text-[var(--ro-text-faint)]">
          الشريط الجانبي الدائم يعرض كل الوحدات التشغيلية المعتمدة بترتيب سير العمل، مع تمييز الموقع
          الحالي بالخلفية واللون والشريط الجانبي — لا الأيقونة وحدها. أنماط المحتوى الفعلية (لوحة
          التحكم، الإيجارات، التفاصيل، النماذج، التحليلات) معروضة في الإطارات المجاورة.
        </p>
      </div>
    </AppFrame>
  );
}
