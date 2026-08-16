import { vehicles } from "./vehicles";
import { customers } from "./customers";
import { rentals } from "./rentals";

export * from "./types";
export { vehicles, customers, rentals };

export const getVehicleById = (id: string) => vehicles.find(v => v.id === id);
export const getCustomerById = (id: string) => customers.find(c => c.id === id);

export const getActiveRentals = () => rentals.filter(r => r.status === "active");

export const getRentalsForVehicle = (vehicleId: string) => rentals.filter(r => r.vehicleIds.includes(vehicleId));
export const getRentalsForCustomer = (customerId: string) => rentals.filter(r => r.customerId === customerId);

const getRentalById = (id: string) => rentals.find(r => r.id === id);

const getTotalPaid = (rentalId: string) => {
  const rental = getRentalById(rentalId);
  if (!rental) return 0;
  return rental.payments.reduce((sum, p) => sum + p.amount, 0);
};

export const getTotalRemaining = (rentalId: string) => {
  const rental = getRentalById(rentalId);
  if (!rental) return 0;
  return Math.max(0, rental.totalAmount - getTotalPaid(rentalId));
};