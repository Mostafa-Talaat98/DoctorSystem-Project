import bookingModel from "../../DB/models/booking.model.js";
import { createActor } from 'xstate';
import { bookingMachine } from './booking.machine.js';
import catchAsync from '../../utils/errors/catchAsync.js';
import AppError from '../../utils/errors/AppError.js';
import bookingErrors from './errorController.js';

// Create booking
export const createBooking = catchAsync(async (req, res, next) => {
  const { doctorId, dateTime, paymentMethod } = req.body;

  if (!doctorId || !dateTime || !paymentMethod) {
    return next(bookingErrors.missingRequiredFields());
  }

  const existingBooking = await bookingModel.findOne({
    doctorId,
    dateTime,
    status: { $ne: 'Cancelled' },
  });

  if (existingBooking) {
    return next(bookingErrors.timeSlotAlreadyBooked());
  }

  if (!['PayPal', 'Stripe', 'Cash'].includes(paymentMethod)) {
    return next(bookingErrors.invalidPaymentMethod());
  }

  if (new Date(dateTime) <= new Date()) {
    return next(bookingErrors.pastDatesNotAllowed());
  }

  const booking = await bookingModel.create({
    doctorId,
    dateTime,
    paymentMethod,
    status: 'Pending',
  });

  res.status(201).json({
    message: 'Booking created successfully',
    booking,
  });
});

// Confirm booking
export const confirmBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await bookingModel.findById(bookingId);
  if (!booking) {
    return next(bookingErrors.bookingNotFound());
  }

  if (booking.status !== 'Pending') {
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
  actor.send({ type: 'CONFIRM' });

  booking.status = 'Confirmed';
  await booking.save();

  res.status(200).json({
    message: 'Booking confirmed successfully',
    booking,
  });
});

// Reschedule booking
export const rescheduleBooking = catchAsync(async (req, res, next) => {
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

  if (booking.status === 'Cancelled') {
    return next(bookingErrors.cannotRescheduleCancelled());
  }

  const conflictingBooking = await bookingModel.findOne({
    doctorId: booking.doctorId,
    dateTime: newDateTime,
    _id: { $ne: bookingId },
    status: { $ne: 'Cancelled' },
  });

  if (conflictingBooking) {
    return next(bookingErrors.timeSlotAlreadyBooked());
  }

  const actor = createActor(bookingMachine);
  actor.start();

  booking.dateTime = newDateTime;
  booking.status = 'Rescheduled';
  await booking.save();

  res.status(200).json({
    message: 'Booking rescheduled successfully',
    booking,
  });
});

// Cancel booking
export const cancelBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  const booking = await bookingModel.findById(bookingId);
  if (!booking) {
    return next(bookingErrors.bookingNotFound());
  }

  if (booking.status === 'Cancelled') {
    return next(bookingErrors.alreadyCancelled());
  }

  const actor = createActor(bookingMachine);
  actor.start();
  actor.send({ type: 'CANCEL' });

  booking.status = 'Cancelled';
  await booking.save();

  res.status(200).json({
    message: 'Booking cancelled successfully',
    booking,
  });
});

// Get booking details
export const getBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await bookingModel.findById(bookingId).populate('doctorId');
  if (!booking) {
    return next(bookingErrors.bookingNotFound());
  }

  res.status(200).json({
    message: 'Booking retrieved successfully',
    booking,
  });
});

// Get all bookings for a doctor
export const getDoctorBookings = catchAsync(async (req, res, next) => {
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

  const bookings = await bookingModel
    .find(filter)
    .sort({ dateTime: 1 })
    .exec();

  res.status(200).json({
    message: 'Bookings retrieved successfully',
    total: bookings.length,
    bookings,
  });
});

// Update booking (generic update handler)
export const updateBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;
  const { status, paymentMethod } = req.body;

  const booking = await bookingModel.findById(bookingId);
  if (!booking) {
    return next(bookingErrors.bookingNotFound());
  }

  // Validate status transitions
  const validTransitions = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Rescheduled', 'Cancelled'],
    Rescheduled: ['Confirmed', 'Cancelled'],
    Cancelled: [],
  };

  if (status && !validTransitions[booking.status]?.includes(status)) {
    return next(
      bookingErrors.invalidTransition(booking.status, status)
    );
  }

  if (status) booking.status = status;
  if (paymentMethod) booking.paymentMethod = paymentMethod;

  await booking.save();

  res.status(200).json({
    message: 'Booking updated successfully',
    booking,
  });
});

// Delete booking (soft delete)
export const deleteBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await bookingModel.findByIdAndUpdate(
    bookingId,
    { status: 'Cancelled' },
    { new: true }
  );

  if (!booking) {
    return next(bookingErrors.bookingNotFound());
  }

  res.status(200).json({
    message: 'Booking deleted successfully',
    booking,
  });
});
