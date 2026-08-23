// Shared status → label/color contract for the rental-ops exploration.
// Status is always communicated as label + color, never color alone.

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusDef {
  label: string;
  tone: StatusTone;
}

export const rentalStatus: Record<string, StatusDef> = {
  active: { label: "نشط", tone: "success" },
  reserved: { label: "محجوز", tone: "info" },
  overdue: { label: "متأخر الإرجاع", tone: "danger" },
  completed: { label: "مكتمل", tone: "neutral" },
  cancelled: { label: "ملغى", tone: "neutral" },
};

export const returnUrgency: Record<string, StatusDef> = {
  overdue: { label: "متأخر", tone: "danger" },
  today: { label: "اليوم", tone: "warning" },
  soon: { label: "قريبًا", tone: "info" },
  normal: { label: "ضمن الموعد", tone: "neutral" },
};

export const paymentStatus: Record<string, StatusDef> = {
  paid: { label: "مدفوع بالكامل", tone: "success" },
  partial: { label: "دفعة جزئية", tone: "warning" },
  unpaid: { label: "غير مدفوع", tone: "danger" },
};

export const vehicleStatus: Record<string, StatusDef> = {
  available: { label: "متاحة", tone: "success" },
  rented: { label: "مؤجرة", tone: "info" },
  maintenance: { label: "في الصيانة", tone: "warning" },
  outOfService: { label: "خارج الخدمة", tone: "danger" },
};

export const maintenanceStatus: Record<string, StatusDef> = {
  scheduled: { label: "مجدولة", tone: "info" },
  inProgress: { label: "قيد التنفيذ", tone: "warning" },
  overdue: { label: "متأخرة", tone: "danger" },
  completed: { label: "منجزة", tone: "neutral" },
};

export const taskStatus: Record<string, StatusDef> = {
  overdue: { label: "متأخرة", tone: "danger" },
  dueToday: { label: "مستحقة اليوم", tone: "warning" },
  upcoming: { label: "قادمة", tone: "info" },
  done: { label: "منجزة", tone: "neutral" },
};

export const toneClasses: Record<StatusTone, { bg: string; text: string; border: string; dot: string }> = {
  success: { bg: "bg-[var(--ro-success-bg)]", text: "text-[var(--ro-success)]", border: "border-[var(--ro-success-border)]", dot: "bg-[var(--ro-success)]" },
  warning: { bg: "bg-[var(--ro-warning-bg)]", text: "text-[var(--ro-warning)]", border: "border-[var(--ro-warning-border)]", dot: "bg-[var(--ro-warning)]" },
  danger: { bg: "bg-[var(--ro-danger-bg)]", text: "text-[var(--ro-danger)]", border: "border-[var(--ro-danger-border)]", dot: "bg-[var(--ro-danger)]" },
  info: { bg: "bg-[var(--ro-info-bg)]", text: "text-[var(--ro-info)]", border: "border-[var(--ro-info-border)]", dot: "bg-[var(--ro-info)]" },
  neutral: { bg: "bg-[var(--ro-neutral-bg)]", text: "text-[var(--ro-neutral)]", border: "border-[var(--ro-neutral-border)]", dot: "bg-[var(--ro-neutral)]" },
};

export const navItems = [
  { key: "dashboard", label: "لوحة التحكم", icon: "LayoutDashboard" },
  { key: "vehicles", label: "المركبات", icon: "Car" },
  { key: "customers", label: "العملاء", icon: "Users" },
  { key: "rentals", label: "الإيجارات", icon: "FileSignature" },
  { key: "maintenance", label: "الصيانة", icon: "Wrench" },
  { key: "expenses", label: "المصاريف", icon: "Receipt" },
  { key: "payments", label: "المدفوعات", icon: "Wallet" },
  { key: "tasks", label: "المهام", icon: "ListChecks" },
  { key: "analytics", label: "التحليلات", icon: "BarChart3" },
  { key: "reports", label: "التقارير", icon: "FileBarChart2" },
  { key: "settings", label: "الإعدادات", icon: "Settings" },
] as const;

export const mobilePrimaryNav = ["dashboard", "rentals", "vehicles", "tasks"] as const;
