import bookingModel from "../../DB/models/booking.model.js";
import DoctorModel from "../../DB/models/DoctorSchema.js";
import mongoose from "mongoose";
import { createActor } from "xstate";
import { bookingMachine } from "./booking.machine.js";
import { successResponse } from "../../utils/response/success.response.js";
import { BadRequestException } from "../../utils/response/error.response.js";
import bookingErrors from "./errorController.js";
import { createPayPalOrder, capturePayPalOrder } from "../../utils/payment/paypal.js";

// Create booking
export const createBooking = async (req, res, next) => {
  const { doctorId, dateTime, paymentMethod } = req.body || {};

  

  const doctorExists = await DoctorModel.findById(doctorId).lean();
  if (!doctorExists) {
    return next(bookingErrors.doctorNotFound());
  }

  const existingBooking = await bookingModel.findOne({
    doctorId,
    dateTime,
    status: { $ne: "Cancelled" },
  });

  if (existingBooking) {
    return next(bookingErrors.timeSlotAlreadyBooked());
  }


  let paypalOrder = null;
  if (paymentMethod === "PayPal") {
    try {
      paypalOrder = await createPayPalOrder({
        amount: doctorExists.sessionPrice || 100,
        description: `Booking with Dr. ${doctorExists.fullName} on ${new Date(dateTime).toLocaleString()}`,
      });
    } catch (error) {
      return next(bookingErrors.paypalOrderCreationFailed());
    }
  }

  const booking = await bookingModel.create({
    doctorId,
    dateTime,
    paymentMethod,
    status: "Pending",
    paypalOrderId: paypalOrder ? paypalOrder.id : undefined,
    paymentStatus: "Pending",
  });

  return successResponse({
    res,
    statusCode: 201,
    message: "Booking created successfully",
    data: {
      booking,
      paypalLink: paypalOrder ? paypalOrder.links.find(link => link.rel === 'approve').href : null
    },
  });
};

// Capture PayPal payment
export const captureBookingPayment = async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await bookingModel.findById(bookingId);
  if (!booking) {
    return next(bookingErrors.bookingNotFound());
  }

  if (!booking.paypalOrderId) {
    return next(new BadRequestException("No PayPal order associated with this booking"));
  }

  try {
    const captureData = await capturePayPalOrder(booking.paypalOrderId);
    
    if (captureData.status === "COMPLETED") {
      booking.paymentStatus = "Paid";
      booking.status = "Confirmed";
      await booking.save();

      return successResponse({
        res,
        statusCode: 200,
        message: "Payment captured and booking confirmed",
        data: booking,
      });
    } else {
      booking.paymentStatus = "Failed";
      await booking.save();
      return next(bookingErrors.paypalCaptureFailed());
    }
  } catch (error) {
    return next(bookingErrors.paypalCaptureFailed());
  }
};

// Confirm booking
export const confirmBooking = async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await bookingModel.findById(bookingId);
  if (!booking) {
    return next(bookingErrors.bookingNotFound());
  }

  if (booking.status !== "Pending") {
    return next(bookingErrors.confirmOnlyPending());
  }

  // Initialize state machine for this booking
  const actor = createActor(bookingMachine, {
    input: {
      bookingId,
      doctorId: booking.doctorId,
      dateTime: booking.dateTime,
      paymentMethod: booking.paymentMethod,
    },
  });

  actor.start();
  actor.send({ type: "CONFIRM" });

  booking.status = "Confirmed";
  await booking.save();

  return successResponse({
    res,
    statusCode: 200,
    message: "Booking confirmed successfully",
    data: booking,
  });
};

// Reschedule booking
export const rescheduleBooking = async (req, res, next) => {
  const { bookingId } = req.params;
  const { newDateTime } = req.body;

  if (!newDateTime) {
    return next(bookingErrors.newDateTimeRequired());
  }

  if (new Date(newDateTime) <= new Date()) {
    return next(bookingErrors.pastDatesNotAllowed());
  }

  const booking = await bookingModel.findById(bookingId);
  if (!booking) {
    return next(bookingErrors.bookingNotFound());
  }

  if (booking.status === "Cancelled") {
    return next(bookingErrors.cannotRescheduleCancelled());
  }

  const conflictingBooking = await bookingModel.findOne({
    doctorId: booking.doctorId,
    dateTime: newDateTime,
    _id: { $ne: bookingId },
    status: { $ne: "Cancelled" },
  });

  if (conflictingBooking) {
    return next(bookingErrors.timeSlotAlreadyBooked());
  }

  const actor = createActor(bookingMachine);
  actor.start();

  booking.dateTime = newDateTime;
  booking.status = "Rescheduled";
  await booking.save();

  return successResponse({
    res,
    statusCode: 200,
    message: "Booking rescheduled successfully",
    data: booking,
  });
};

// Cancel booking
export const cancelBooking = async (req, res, next) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  const booking = await bookingModel.findById(bookingId);
  if (!booking) {
    return next(bookingErrors.bookingNotFound());
  }

  if (booking.status === "Cancelled") {
    return next(bookingErrors.alreadyCancelled());
  }

  const actor = createActor(bookingMachine);
  actor.start();
  actor.send({ type: "CANCEL" });

  booking.status = "Cancelled";
  await booking.save();

  return successResponse({
    res,
    statusCode: 200,
    message: "Booking cancelled successfully",
    data: booking,
  });
};

// Get booking details
export const getBooking = async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await bookingModel.findById(bookingId).populate("doctorId");
  if (!booking) {
    return next(bookingErrors.bookingNotFound());
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Booking retrieved successfully",
    data: booking,
  });
};

// Get all bookings for a doctor
export const getDoctorBookings = async (req, res, next) => {
  const { doctorId } = req.params;
  const { status, startDate, endDate } = req.query;

  const filter = { doctorId };

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.dateTime = {};
    if (startDate) {
      filter.dateTime.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.dateTime.$lte = new Date(endDate);
    }
  }

  const bookings = await bookingModel.find(filter).sort({ dateTime: 1 }).exec();

  return successResponse({
    res,
    statusCode: 200,
    message: "Bookings retrieved successfully",
    info: { total: bookings.length },
    data: bookings,
  });
};

// Update booking (generic update handler)
export const updateBooking = async (req, res, next) => {
  const { bookingId } = req.params;
  const { status, paymentMethod } = req.body;

  const booking = await bookingModel.findById(bookingId);
  if (!booking) {
    return next(bookingErrors.bookingNotFound());
  }

  // Validate status transitions
  const validTransitions = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Rescheduled", "Cancelled"],
    Rescheduled: ["Confirmed", "Cancelled"],
    Cancelled: [],
  };

  if (status && !validTransitions[booking.status]?.includes(status)) {
    return next(bookingErrors.invalidTransition(booking.status, status));
  }

  if (status) booking.status = status;
  if (paymentMethod) booking.paymentMethod = paymentMethod;

  await booking.save();

  return successResponse({
    res,
    statusCode: 200,
    message: "Booking updated successfully",
    data: booking,
  });
};

// Delete booking (soft delete)
export const deleteBooking = async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await bookingModel.findByIdAndUpdate(
    bookingId,
    { status: "Cancelled" },
    { new: true }
  );

  if (!booking) {
    return next(bookingErrors.bookingNotFound());
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Booking deleted successfully",
    data: booking,
  });
};
