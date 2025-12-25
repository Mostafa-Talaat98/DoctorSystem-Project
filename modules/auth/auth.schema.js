import joi from 'joi';
import { OtpType } from './Otp/otp.types.js';
import dotenv from 'dotenv';
import { getAuthConfig } from '../../utils/security/jwtToken.security.js';
import { Token } from '../../utils/types/token/token.types.js';
dotenv.config();


const REGEX = {
  FULL_NAME: /^[A-Za-z]+(?:\s[A-Za-z]+)+$/,
  PHONE: /^(\+20|0)1[0125][0-9]{8}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
  OTP: /^[0-9]{4}$/,
};

export const patientSignUpSchema = joi.object({
  fullName: joi.string().trim().pattern(REGEX.FULL_NAME).min(3).required().messages({
    'string.min': 'Full name must be at least 3 characters',
    'string.pattern.base': 'Full name must contain at least first and last name, letters only',
    'any.required': "'fullName' is required.",
  }),

  email: joi.string().trim().email().required().messages({
    'string.email': 'Email must be a valid email address.',
    'any.required': "'email' is required.",
  }),

  phoneNumber: joi.string().pattern(REGEX.PHONE).required().messages({
    'string.pattern.base': 'Invalid Egyptian phone number',
    'any.required': "'phoneNumber' is required.",
  }),

  password: joi.string().trim().min(8).pattern(REGEX.PASSWORD).required().messages({
    'string.min': 'Password must be at least 8 characters long.',
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.',
    'any.required': "'password' is required.",
  }),

  birthday: joi
    .date()
    .less('now')
    .custom((value, helpers) => {
      const today = new Date();
      const birthDate = new Date(value);

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        return helpers.error('date.minAge');
      }

      return value;
    })
    .required()
    .messages({
      'date.base': 'Birthday must be a valid date',
      'date.less': 'Birthday must be in the past',
      'date.minAge': 'You must be at least 18 years old',
      'any.required': "'birthday' is required",
    }),
});

export const doctorSignUpSchema = joi.object({
  fullName: joi.string().trim().pattern(REGEX.FULL_NAME).min(3).required().messages({
    'string.min': 'Full name must be at least 3 characters',
    'string.pattern.base': 'Full name must contain at least first and last name, letters only',
    'any.required': "'fullName' is required.",
  }),

  email: joi.string().trim().email().required().messages({
    'string.email': 'Email must be a valid email address.',
    'any.required': "'email' is required.",
  }),

  phoneNumber: joi.string().pattern(REGEX.PHONE).required().messages({
    'string.pattern.base': 'Invalid Egyptian phone number',
    'any.required': "'phoneNumber' is required.",
  }),

  password: joi.string().trim().min(8).pattern(REGEX.PASSWORD).required().messages({
    'string.min': 'Password must be at least 8 characters long.',
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.',
    'any.required': "'password' is required.",
  }),
  birthday: joi
    .date()
    .less('now')
    .custom((value, helpers) => {
      const today = new Date();
      const birthDate = new Date(value);

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        return helpers.error('date.minAge');
      }

      return value;
    })
    .required()
    .messages({
      'date.base': 'Birthday must be a valid date',
      'date.less': 'Birthday must be in the past',
      'date.minAge': 'You must be at least 18 years old',
      'any.required': "'birthday' is required",
    }),
});

export const signInWithEmailSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address.',
    'any.required': "'email' is required.",
  }),
  password: joi.string().trim().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long.',
    'any.required': "'password' is required.",
  }),
});

export const signInWithPhoneSchema = joi.object({
  phoneNumber: joi.string().pattern(REGEX.PHONE).required().messages({
    'string.pattern.base': 'Invalid phone number',
  }),
});

export const otpValidationSchema = joi
  .object({
    otpCode: joi.string().length(4).pattern(REGEX.OTP).required().messages({
      'string.length': 'OTP must be 4 digits long.',
      'string.pattern.base': 'OTP must only contain digits.',
      'any.required': "'otpCode' is required.",
    }),

    email: joi.string().required().email().messages({
      'string.email': 'Email must be a valid email address.',
      'any.required': "'email' is required.",
    }),

    phoneNumber: joi.string().pattern(REGEX.PHONE).messages({
      'string.pattern.base': 'Invalid phone number',
    }),
  })
  .xor('email', 'phoneNumber')
  .messages({
    'object.xor': 'Please provide either an email or a phone number to verify the OTP.',
  });

export const reSendOTPSchema = joi.object({
  email: joi.string().email().messages({
    'string.email': 'Email must be a valid email address.',
    'any.required': "'email' is required.",
  }),

  type: joi
    .string()
    .valid(...Object.values(OtpType))
    .required()
    .messages({
      'any.only': `Type must be one of ${Object.values(OtpType).join(', ')}`,
      'string.empty': "'type' is required",
    }),
});

export const registerWithGoogleSchema = joi.object({
  id_token: joi.string().required().min(1000).messages({
    'any.required': "'id_token' in required",
    'any.min': 'Invalid id token provided',
  }),
});

export const refreshTokenSchema = joi
  .object({
    [getAuthConfig(Token.REFRESH_TOKEN).key]: joi
      .string()
      .required()
      .messages({
        'any.required': `'${getAuthConfig(Token.REFRESH_TOKEN).key}' is required`,
      }),
  })
  .unknown(true);
