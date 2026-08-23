import { navItems } from "./statusConfig";
import { iconMap } from "./icons";

/** Full desktop sidebar (>=1024px). Current location shown via surface + label + bar, not icon color alone. */
export function Sidebar({ active }: { active: string }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[var(--ro-primary-dark)] text-white lg:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-base font-bold">
          مؤ
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold">مكتب المؤجر</div>
          <div className="text-[11px] text-white/60">إدارة تأجير المركبات</div>
        </div>
      </div>

      <nav className="rental-ops-scroll flex-1 overflow-y-auto px-3 py-2">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = item.key === active;
            return (
              <li key={item.key} className="relative">
                {isActive && (
                  <span className="absolute inset-y-1 end-0 w-1 rounded-full bg-white" />
                )}
                <a
                  href="#"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  <span className="flex-1">{item.label}</span>
                  {"note" in item && item.note && (
                    <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-normal text-white/60">
                      {item.note}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
            هـع
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-semibold">هبة العتيبي</div>
            <div className="truncate text-[11px] text-white/50">مديرة الفرع</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Compact tablet rail (768–1023px): icon + short label, distinct middle state between mobile and desktop. */
export function TabletRail({ active }: { active: string }) {
  return (
    <aside className="flex w-20 shrink-0 flex-col items-center bg-[var(--ro-primary-dark)] py-3 text-white">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-sm font-bold">
        مؤ
      </div>
      <nav className="rental-ops-scroll flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-2">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = item.key === active;
          return (
            <a
              key={item.key}
              href="#"
              className={`flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2 text-center text-[10px] font-medium leading-tight ${
                isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              <span className="line-clamp-1">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
