<<<<<<< HEAD
import Joi from "joi";

export const signUpSchema = Joi.object({
  userName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9+\-() ]{7,20}$/)
    .required(),
  role: Joi.string().valid("PATIENT", "DOCTOR").optional(),
});

export default signUpSchema;
=======
import joi from "joi"

export const registerSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address.',
    'any.required': 'Email is required.',
  }),

  password: joi
    .string()
    .required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])')) // At least one uppercase, one lowercase, one number, and one symbol - [ NOT REQUIRED IN THE DOCUMENTATION ]
    .min(8) // [ NOT REQUIRED IN THE DOCUMENTATION ]
    .messages({
      'string.min': 'Password must be at least 8 characters long.',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.',
      'any.required': 'Password is required.',
    }),

  confirmPassword: joi.string().valid(joi.ref('password')).required().messages({
    'any.only': 'Confirmation password does not match the password.',
    'any.required': 'Confirmation password is required.',
  }),
});

export const loginSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address.',
    'any.required': 'Email is required.',
  }),

  password: joi.string().required().messages({
    'any.required': 'Password is required.',
  }),

  otp: joi.string()
    .length(6) // [ NOT REQUIRED IN THE DOCUMENTATION ]
    .pattern(/^[0-9]{6}$/) // [ NOT REQUIRED IN THE DOCUMENTATION ]
    .required()
    .messages({
      'string.length': 'OTP must be 6 digits long.',
      'string.pattern.base': 'OTP must only contain digits.',
      'any.required': 'Two-Factor Authentication (OTP) code is required.',
    }),
});
>>>>>>> validation
