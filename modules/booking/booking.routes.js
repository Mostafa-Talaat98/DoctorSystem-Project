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
} from "./booking.controller.js";

const bookRouter = Router();

// Create booking
bookRouter.post("/", createBooking);

// Get bookings
bookRouter.get("/doctor/:doctorId", getDoctorBookings);
bookRouter.get("/:bookingId", getBooking);

// Update booking status
bookRouter.patch("/:bookingId/confirm", confirmBooking);
bookRouter.patch("/:bookingId/reschedule", rescheduleBooking);
bookRouter.patch("/:bookingId/cancel", cancelBooking);
bookRouter.patch("/:bookingId", updateBooking);

// Delete booking
bookRouter.delete("/:bookingId", deleteBooking);

export default bookRouter;
