import joi from "joi";

const objectIdSchema = joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/).messages({
  "string.pattern.base": "{#label} has invalid ID format (must be a 24-character hex string)",
});

export const createBookingSchema = joi.object({
  doctorId: objectIdSchema.required().messages({
    "any.required": "{#label} is required",
  }),
  dateTime: joi.date().greater("now").required().messages({
    "date.greater": "{#label} must be in the future",
    "any.required": "{#label} is required",
  }),
  paymentMethod: joi.string().valid("PayPal", "Cash").required().messages({
    "any.only": "{#label} must be one of PayPal, or Cash",
    "any.required": "{#label} is required",
  }),
}).unknown(true);

export const getDoctorBookingsSchema = joi.object({
  doctorId: objectIdSchema.required().messages({
    "any.required": "{#label} is required",
  }),
  status: joi.string().valid("Pending", "Confirmed", "Cancelled", "Rescheduled"),
  startDate: joi.date(),
  endDate: joi.date().greater(joi.ref("startDate")).messages({
    "date.greater": "{#label} must be after start date",
  }),
}).unknown(true);

export const bookingIdSchema = joi.object({
  bookingId: objectIdSchema.required().messages({
    "any.required": "{#label} is required",
  }),
}).unknown(true);

export const rescheduleBookingSchema = joi.object({
  bookingId: objectIdSchema.required().messages({
    "any.required": "{#label} is required",
  }),
  newDateTime: joi.date().greater("now").required().messages({
    "date.greater": "{#label} must be in the future",
    "any.required": "{#label} is required",
  }),
}).unknown(true);

export const cancelBookingSchema = joi.object({
  bookingId: objectIdSchema.required().messages({
    "any.required": "{#label} is required",
  }),
  reason: joi.string().max(500),
}).unknown(true);

export const updateBookingSchema = joi.object({
  bookingId: objectIdSchema.required().messages({
    "any.required": "{#label} is required",
  }),
  status: joi.string().valid("Pending", "Confirmed", "Cancelled", "Rescheduled"),
  paymentMethod: joi.string().valid("PayPal", "Stripe", "Cash"),
}).unknown(true);
