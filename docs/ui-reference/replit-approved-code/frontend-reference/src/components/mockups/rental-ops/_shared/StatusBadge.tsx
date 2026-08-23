import { toneClasses, type StatusDef } from "./statusConfig";

export function StatusBadge({ status, size = "md" }: { status: StatusDef; size?: "sm" | "md" }) {
  const c = toneClasses[status.tone];
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border font-semibold ${pad} ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
      {status.label}
    </span>
  );
}