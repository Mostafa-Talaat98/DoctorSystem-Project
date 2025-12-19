import AppError from "../../utils/errors/AppError.js";

export const bookingErrors = {
  // Generic/common
  missingRequiredFields: () => new AppError("Missing required fields", 400),
  invalidPaymentMethod: () => new AppError("Invalid payment method", 400),
  pastDatesNotAllowed: () => new AppError("Cannot book past dates", 400),
  bookingNotFound: () => new AppError("Booking not found", 404),
  timeSlotAlreadyBooked: () => new AppError("Time slot already booked", 409),
  alreadyCancelled: () => new AppError("Booking is already cancelled", 400),

  // Flow-specific
  confirmOnlyPending: () =>
    new AppError("Can only confirm pending bookings", 400),
  cannotRescheduleCancelled: () =>
    new AppError("Cannot reschedule cancelled bookings", 400),
  newDateTimeRequired: () => new AppError("New date/time is required", 400),
  doctorIdAndDateRequired: () =>
    new AppError("Doctor ID and date are required", 400),

  // Transition errors
  invalidTransition: (from, to) =>
    new AppError(`Cannot transition from ${from} to ${to}`, 400),
};

export default bookingErrors;
