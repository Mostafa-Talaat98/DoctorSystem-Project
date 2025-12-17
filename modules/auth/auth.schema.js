import joi from 'joi';

const REGEX = {
  FULL_NAME: /^[A-Za-z]+(?:\s[A-Za-z]+)+$/,
  PHONE: /^(\+20|0)1[0125][0-9]{8}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
  OTP: /^[0-9]{4}$/,
};

/**
 * @description Validation for User Registration
 * @body {string} fullName - Min 3 chars, requires at least two words (First & Last).
 * @body {string} email - Must be a valid RFC 5322 email format.
 * @body {string} phoneNumber - Must be a valid Egyptian mobile number.
 * @body {string} password - Min 8 chars, must include 1 uppercase, 1 lowercase, 1 digit, and 1 special character.
 */
export const signUpSchema = joi.object({
  fullName: joi.string().trim().pattern(REGEX.FULL_NAME).min(3).required().messages({
    'string.min': 'Full name must be at least 3 characters',
    'string.pattern.base': 'Full name must contain at least first and last name, letters only',
    'any.required': 'Full name is required.',
  }),

  email: joi.string().trim().email().required().messages({
    'string.email': 'Email must be a valid email address.',
    'any.required': 'Email is required.',
  }),

  phoneNumber: joi.string().pattern(REGEX.PHONE).required().messages({
    'string.pattern.base': 'Invalid Egyptian phone number',
    'any.required': 'Phone number is required.',
  }),

  password: joi.string().trim().min(8).pattern(REGEX.PASSWORD).required().messages({
    'string.min': 'Password must be at least 8 characters long.',
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.',
    'any.required': 'Password is required.',
  }),
});

/**
 * @description Validation for Standard Email/Password Sign-In
 * @body {string} email - Valid email address of the registered user.
 * @body {string} password - Raw password string (checked against hash in DB).
 */
export const signInWithEmailSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: joi.string().trim().min(8).pattern(REGEX.PASSWORD).required().messages({
    'string.min': 'Password must be at least 8 characters long.',
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.',
    'any.required': 'Password is required.',
  }),
});

/**
 * @description Validation for Phone Number Sign-In (Initial Step)
 * @body {string} phoneNumber - Valid Egyptian phone number to trigger OTP.
 */
export const signInWithPhoneSchema = joi.object({
  phoneNumber: joi.string().pattern(REGEX.PHONE).required().messages({
    'string.pattern.base': 'Invalid phone number',
  }),
});

/**
 * @description Validation for OTP Verification Step
 * @logic Uses XOR: Must provide (otpCode + email) OR (otpCode + phoneNumber).
 * @body {string} otpCode - 4-digit numeric string sent via Email/SMS.
 * @body {string} [email] - Required if verifying an email-based login.
 * @body {string} [phoneNumber] - Required if verifying a phone-based login.
 */
export const otpValidationSchema = joi
  .object({
    otpCode: joi.string().length(4).pattern(REGEX.OTP).required().messages({
      'string.length': 'OTP must be 4 digits long.',
      'string.pattern.base': 'OTP must only contain digits.',
      'any.required': 'OTP code is required.',
    }),

    email: joi.string().email().messages({
      'string.email': 'Email must be a valid email address.',
    }),

    phoneNumber: joi.string().pattern(REGEX.PHONE).messages({
      'string.pattern.base': 'Invalid phone number',
    }),
  })
  .xor('email', 'phoneNumber')
  .messages({
    'object.xor': 'Please provide either an email or a phone number to verify the OTP.',
  });
