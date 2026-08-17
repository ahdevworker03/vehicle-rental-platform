import type { Rental } from "@/data/types";

export function getTotalPaid(rental: Rental): number {
  return rental.payments.reduce((sum, p) => sum + p.amount, 0);
}

export function getRemaining(rental: Rental): number {
  return Math.max(0, rental.totalAmount - getTotalPaid(rental));
}

export function getActiveRentals(rentals: Rental[]): Rental[] {
  return rentals.filter((r) => r.status === "active");
}

export function getEndedRentals(rentals: Rental[]): Rental[] {
  return rentals.filter((r) => r.status === "ended");
}

export function getRentalsEndingSoon(rentals: Rental[], daysFromToday: (dateStr: string) => number): Rental[] {
  return rentals
    .filter((r) => r.status === "active")
    .filter((r) => {
      const days = daysFromToday(r.endDate);
      return days >= 0 && days <= 2;
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
}

export function getRecentEndedRentals(rentals: Rental[], limit: number): Rental[] {
  return rentals
    .filter((r) => r.status === "ended" && r.returnDate)
    .sort(
      (a, b) => new Date(b.returnDate!).getTime() - new Date(a.returnDate!).getTime()
    )
    .slice(0, limit);
}
