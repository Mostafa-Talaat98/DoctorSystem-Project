import { Router } from "express";
import {
  createBooking,
  getBooking,
  getDoctorBookings,
  confirmBooking,
  rescheduleBooking,
  cancelBooking,
  updateBooking,
  deleteBooking,
} from "./booking.service.js";

const bookingRouter = Router();

// Create booking
bookingRouter.post("/", createBooking);

// Get bookings
bookingRouter.get("/doctor/:doctorId", getDoctorBookings);
bookingRouter.get("/:bookingId", getBooking);

// Update booking status
bookingRouter.patch("/:bookingId/confirm", confirmBooking);
bookingRouter.patch("/:bookingId/reschedule", rescheduleBooking);
bookingRouter.patch("/:bookingId/cancel", cancelBooking);
bookingRouter.patch("/:bookingId", updateBooking);

// Delete booking
bookingRouter.delete("/:bookingId", deleteBooking);

export default bookingRouter;
