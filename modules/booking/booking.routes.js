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

const router = Router();

// Create booking
router.post("/", createBooking);

// Get bookings
router.get("/doctor/:doctorId", getDoctorBookings);
router.get("/:bookingId", getBooking);

// Update booking status
router.patch("/:bookingId/confirm", confirmBooking);
router.patch("/:bookingId/reschedule", rescheduleBooking);
router.patch("/:bookingId/cancel", cancelBooking);
router.patch("/:bookingId", updateBooking);

// Delete booking
router.delete("/:bookingId", deleteBooking);

export default router;
