import type { ReactNode } from "react";

/**
 * Isolates a numeric/Latin value (phone number, license expiry date, plate, etc.)
 * from the surrounding RTL paragraph so multi-group numbers (space- or dash-separated)
 * never get their groups visually reordered by the browser's bidi algorithm.
 * Use whenever a Western-numeral value is concatenated with Arabic text in one string,
 * or rendered as a standalone value next to Arabic labels.
 */
export function Ltr({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={`inline-block ${className}`} style={{ unicodeBidi: "isolate" }}>
      {children}
    </span>
  );
}
