import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Car,
  ClipboardList,
  FileText,
  Home,
  ReceiptText,
  Users,
  Wrench,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  shortLabel: string;
  route: string;
  icon: LucideIcon;
}

export interface NavigationGroup {
  label: string;
  items: readonly NavigationItem[];
}

const dashboard: NavigationItem = {
  label: "لوحة التحكم",
  shortLabel: "الرئيسية",
  route: "/",
  icon: Home,
};

const vehicles: NavigationItem = {
  label: "المركبات",
  shortLabel: "المركبات",
  route: "/vehicles",
  icon: Car,
};

const customers: NavigationItem = {
  label: "العملاء",
  shortLabel: "العملاء",
  route: "/customers",
  icon: Users,
};

const rentals: NavigationItem = {
  label: "الإيجارات",
  shortLabel: "الإيجارات",
  route: "/rentals",
  icon: FileText,
};

const maintenance: NavigationItem = {
  label: "الصيانة",
  shortLabel: "الصيانة",
  route: "/maintenance",
  icon: Wrench,
};

const expenses: NavigationItem = {
  label: "المصاريف",
  shortLabel: "المصاريف",
  route: "/expenses",
  icon: ReceiptText,
};

const tasks: NavigationItem = {
  label: "المهام",
  shortLabel: "المهام",
  route: "/tasks",
  icon: ClipboardList,
};

const analytics: NavigationItem = {
  label: "التحليلات",
  shortLabel: "التحليلات",
  route: "/analytics",
  icon: BarChart3,
};

const reports: NavigationItem = {
  label: "التقارير",
  shortLabel: "التقارير",
  route: "/reports",
  icon: FileText,
};

const account: NavigationItem = {
  label: "حساب المؤسسة",
  shortLabel: "الحساب",
  route: "/account",
  icon: Building2,
};

/**
 * Existing application routes only. Payments remains rental-contextual because
 * the product has no organization-wide payments review route to expose.
 */
export const NAVIGATION_GROUPS = [
  {
    label: "إدارة التأجير",
    items: [dashboard, vehicles, customers, rentals],
  },
  {
    label: "العمليات اليومية",
    items: [maintenance, expenses, tasks],
  },
  {
    label: "متابعة الأعمال",
    items: [analytics, reports],
  },
  {
    label: "الحساب",
    items: [account],
  },
] as const satisfies readonly NavigationGroup[];

export const ALL_NAVIGATION_ITEMS = NAVIGATION_GROUPS.flatMap(
  (group) => group.items,
);

/** The four fastest operational destinations remain pinned on mobile. */
export const MOBILE_PRIMARY_NAVIGATION = [
  dashboard,
  rentals,
  vehicles,
  customers,
] as const;

export function isNavigationRouteActive(
  location: string,
  route: string,
): boolean {
  return route === "/" ? location === "/" : location.startsWith(route);
}

export function isMobileMoreRoute(location: string): boolean {
  return !MOBILE_PRIMARY_NAVIGATION.some((item) =>
    isNavigationRouteActive(location, item.route),
  );
}
