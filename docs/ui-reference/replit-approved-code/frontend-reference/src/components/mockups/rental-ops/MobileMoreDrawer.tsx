import { AppFrame } from "./_shared/AppFrame";

/**
 * Standalone concept for the mobile "المزيد" drawer, forced open so it can be
 * reviewed as its own screen. It exposes every module not already pinned in
 * the bottom nav (dashboard/rentals/vehicles/tasks).
 */
export function MobileMoreDrawer() {
  return (
    <AppFrame variant="mobile" active="dashboard" mobileNavForceOpen>
      <div className="flex items-center justify-between border-b border-[var(--ro-border)] bg-[var(--ro-surface)] px-4 py-3.5">
        <h1 className="text-base font-bold text-[var(--ro-text)]">لوحة التحكم</h1>
      </div>
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2 p-6 text-center">
        <div className="text-sm font-semibold text-[var(--ro-text-muted)]">قائمة "المزيد" مفتوحة أسفل الشاشة</div>
        <p className="max-w-[240px] text-xs text-[var(--ro-text-faint)]">
          تعرض كل الوحدات غير المثبتة في الشريط السفلي: المصاريف، المدفوعات، المهام، التحليلات،
          التقارير، والإعدادات.
        </p>
      </div>
    </AppFrame>
  );
}
