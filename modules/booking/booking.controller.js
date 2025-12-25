import { Router } from "express";
import { authenticateUser } from "../middleware/authenticateUser.middleware.js";
import { validateRequest } from "../middleware/validateRequest.middleware.js";
import {
  createBookingSchema,
  getDoctorBookingsSchema,
  bookingIdSchema,
  rescheduleBookingSchema,
  cancelBookingSchema,
  updateBookingSchema,
} from "./booking.schema.js";
import {
  createBooking,
  getBooking,
  getDoctorBookings,
  confirmBooking,
  rescheduleBooking,
  cancelBooking,
  updateBooking,
  deleteBooking,
  captureBookingPayment,
} from "./booking.service.js";

const bookingRouter = Router();

bookingRouter.use(authenticateUser());

bookingRouter.post("/", validateRequest(createBookingSchema), createBooking);

bookingRouter.get(
  "/doctor/:doctorId",
  validateRequest(getDoctorBookingsSchema),
  getDoctorBookings
);
bookingRouter.get("/:bookingId", validateRequest(bookingIdSchema), getBooking);

bookingRouter.patch(
  "/confirm/:bookingId",
  validateRequest(bookingIdSchema),
  confirmBooking
);
bookingRouter.patch(
  "/reschedule/:bookingId",
  validateRequest(rescheduleBookingSchema),
  rescheduleBooking
);
bookingRouter.patch(
  "/cancel/:bookingId",
  validateRequest(cancelBookingSchema),
  cancelBooking
);
bookingRouter.patch(
  "/capture/:bookingId",
  validateRequest(bookingIdSchema),
  captureBookingPayment
);
bookingRouter.patch(
  "/:bookingId",
  validateRequest(updateBookingSchema),
  updateBooking
);

bookingRouter.delete(
  "/:bookingId",
  validateRequest(bookingIdSchema),
  deleteBooking
);

export default bookingRouter;