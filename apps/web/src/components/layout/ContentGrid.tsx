import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContentGridVariant = "summary" | "detail" | "form";

interface ContentGridProps {
  children: ReactNode;
  variant?: ContentGridVariant;
  className?: string;
}

const gridVariants: Record<ContentGridVariant, string> = {
  summary: "grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
  detail: "grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]",
  form: "grid-cols-1 gap-4 md:grid-cols-2",
};

/** Reusable responsive grid for summary, detail, and form compositions. */
export function ContentGrid({ children, variant = "summary", className }: ContentGridProps) {
  return <div className={cn("grid", gridVariants[variant], className)}>{children}</div>;
}
