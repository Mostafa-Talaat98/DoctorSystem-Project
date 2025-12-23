import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  ValidationException,
} from "../../utils/response/error.response.js";

export const bookingErrors = {
  // Generic/common
  missingRequiredFields: () =>
    new ValidationException("Missing required fields"),
  invalidPaymentMethod: () => new BadRequestException("Invalid payment method"),
  pastDatesNotAllowed: () => new BadRequestException("Cannot book past dates"),
  bookingNotFound: () => new NotFoundException("Booking not found"),
  timeSlotAlreadyBooked: () =>
    new ConflictException("Time slot already booked"),
  alreadyCancelled: () =>
    new BadRequestException("Booking is already cancelled"),
  doctorNotFound: () => new NotFoundException("Doctor not found"),
  invalidDoctorId: () => new ValidationException("Invalid doctor id"),

  // Flow-specific
  confirmOnlyPending: () =>
    new BadRequestException("Can only confirm pending bookings"),
  cannotRescheduleCancelled: () =>
    new BadRequestException("Cannot reschedule cancelled bookings"),
  newDateTimeRequired: () =>
    new BadRequestException("New date/time is required"),
  doctorIdAndDateRequired: () =>
    new ValidationException("Doctor ID and date are required"),

  // Transition errors
  invalidTransition: (from, to) =>
    new BadRequestException(`Cannot transition from ${from} to ${to}`),
};

export default bookingErrors;
