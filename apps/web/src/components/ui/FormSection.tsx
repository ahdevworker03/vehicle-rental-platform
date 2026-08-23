import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
  contentClassName?: string;
}

/** A form section with deliberate grouping and a responsive two-column field grid. */
export function FormSection({
  children,
  title,
  description,
  className,
  contentClassName,
}: FormSectionProps) {
  return (
    <section className={cn("rounded-xl border border-card-border bg-card shadow-sm", className)}>
      <header className="border-b border-border px-4 py-3 sm:px-5">
        <h2 className="ui-section-title">{title}</h2>
        {description && <p className="ui-secondary-text mt-1">{description}</p>}
      </header>
      <div className={cn("grid grid-cols-1 gap-4 p-4 md:grid-cols-2 sm:p-5", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
