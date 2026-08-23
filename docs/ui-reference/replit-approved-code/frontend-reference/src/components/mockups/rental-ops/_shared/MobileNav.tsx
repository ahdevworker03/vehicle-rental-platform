import { navItems, mobilePrimaryNav } from "./statusConfig";
import { iconMap } from "./icons";
import { Menu } from "lucide-react";
import { useState } from "react";

/** Compact bottom nav for the highest-frequency destinations + a "المزيد" drawer for the full module set. */
export function MobileNav({ active, forceOpen = false }: { active: string; forceOpen?: boolean }) {
  const [open, setOpen] = useState(forceOpen);
  const primary = navItems.filter((n) => (mobilePrimaryNav as readonly string[]).includes(n.key));
  const rest = navItems.filter((n) => !(mobilePrimaryNav as readonly string[]).includes(n.key));

  return (
    <>
      <nav className="grid shrink-0 grid-cols-5 border-t border-[var(--ro-border)] bg-[var(--ro-surface)] pb-[env(safe-area-inset-bottom)]">
        {primary.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = item.key === active;
          return (
            <a
              key={item.key}
              href="#"
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                isActive ? "text-[var(--ro-primary)]" : "text-[var(--ro-text-faint)]"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
              {item.label}
            </a>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-[var(--ro-text-faint)]"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
          المزيد
        </button>
      </nav>

      {open && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="rounded-t-2xl bg-[var(--ro-surface)] p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--ro-border)]" />
            <div className="mb-3 text-sm font-bold text-[var(--ro-text)]">كل الوحدات</div>
            <div className="grid grid-cols-3 gap-3">
              {rest.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <a
                    key={item.key}
                    href="#"
                    className="flex flex-col items-center gap-2 rounded-xl border border-[var(--ro-border)] py-3 text-center text-xs font-medium text-[var(--ro-text)]"
                  >
                    <Icon className="h-5 w-5 text-[var(--ro-primary)]" strokeWidth={2} />
                    {item.label}
                    {"note" in item && item.note && (
                      <span className="rounded border border-[var(--ro-border)] px-1 py-0.5 text-[9px] text-[var(--ro-text-faint)]">
                        {item.note}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
