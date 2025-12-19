import express from "express";
import * as bookingController from "./booking.controller.js";

const router = express.Router();

router.post("/", bookingController.createBooking);
router.get("/doctor/:doctorId", bookingController.getDoctorBookings);
router.get("/:bookingId", bookingController.getBooking);
router.patch("/:bookingId/confirm", bookingController.confirmBooking);
router.patch("/:bookingId/reschedule", bookingController.rescheduleBooking);
router.patch("/:bookingId/cancel", bookingController.cancelBooking);
router.patch("/:bookingId", bookingController.updateBooking);
router.delete("/:bookingId", bookingController.deleteBooking);

export default router;
