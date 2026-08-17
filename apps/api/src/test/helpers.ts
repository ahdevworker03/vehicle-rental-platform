import { prisma } from "../database";

interface SeedOrg {
  orgId: string;
  vehicleId: string;
  otherVehicleId: string;
  otherOrgId: string;
  otherOrgVehicleId: string;
}

async function cleanup(): Promise<void> {
  await prisma.refreshToken.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.maintenance.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.contract.deleteMany({});
  await prisma.rental.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.organization.deleteMany({});
}

async function seed(): Promise<SeedOrg> {
  const org = await prisma.organization.create({ data: { name: "Org A" } });
  const otherOrg = await prisma.organization.create({
    data: { name: "Org B" },
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      organization_id: org.id,
      make: "Toyota",
      model: "Corolla",
      plate_number: "MAINT-1",
      year: 2020,
      color: "White",
      transmission: "AUTOMATIC",
      fuel_type: "PETROL",
      seats: 5,
      current_mileage: 1000,
      status: "AVAILABLE",
    },
  });

  const otherVehicle = await prisma.vehicle.create({
    data: {
      organization_id: org.id,
      make: "Honda",
      model: "Civic",
      plate_number: "MAINT-2",
      year: 2019,
      color: "Black",
      transmission: "MANUAL",
      fuel_type: "DIESEL",
      seats: 5,
      current_mileage: 2000,
      status: "AVAILABLE",
    },
  });

  const otherOrgVehicle = await prisma.vehicle.create({
    data: {
      organization_id: otherOrg.id,
      make: "Nissan",
      model: "Sunny",
      plate_number: "MAINT-3",
      year: 2018,
      color: "Blue",
      transmission: "MANUAL",
      fuel_type: "PETROL",
      seats: 5,
      current_mileage: 3000,
      status: "AVAILABLE",
    },
  });

  return {
    orgId: org.id,
    vehicleId: vehicle.id,
    otherVehicleId: otherVehicle.id,
    otherOrgId: otherOrg.id,
    otherOrgVehicleId: otherOrgVehicle.id,
  };
}

export { cleanup, seed };
export type { SeedOrg };
