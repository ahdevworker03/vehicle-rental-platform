import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  action?: ReactNode;
}

export function PageHeader({
  title,
  showBack,
  onBack,
  action,
}: PageHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <header className="sticky top-0 z-40 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            aria-label="رجوع"
            className="-me-2 flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-muted active:bg-muted"
          >
            <ChevronRight className="w-6 h-6 text-foreground" strokeWidth={2} />
          </button>
        )}
        <h1 className="ui-page-title m-0 truncate text-xl">{title}</h1>
      </div>
      {action && <div className="flex shrink-0 items-center">{action}</div>}
    </header>
  );
}
