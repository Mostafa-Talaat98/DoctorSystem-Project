import { Router } from "express";
import { authenticateUser } from "../middleware/authenticateUser.middleware.js";
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

// Require authentication for all booking routes
bookingRouter.use(authenticateUser());

// Create booking
bookingRouter.post("/", createBooking);

// Get bookings
bookingRouter.get("/doctor/:doctorId", getDoctorBookings);
bookingRouter.get("/:bookingId", getBooking);

// Update booking status
bookingRouter.patch("/confirm/:bookingId", confirmBooking);
bookingRouter.patch("/reschedule/:bookingId", rescheduleBooking);
bookingRouter.patch("/cancel/:bookingId", cancelBooking);
bookingRouter.patch("/:bookingId", updateBooking);

// Delete booking
bookingRouter.delete("/:bookingId", deleteBooking);

export default bookingRouter;
