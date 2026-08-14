export {
  listRentals,
  getRental,
  createRental,
  updateRental,
  pickupRental,
  returnRental,
  extendRental,
  cancelRental,
  deleteRental,
  checkAvailability,
} from "./rental.service";
export type {
  RentalResponse,
  CreateRentalInput,
  UpdateRentalInput,
} from "./rental.types";
