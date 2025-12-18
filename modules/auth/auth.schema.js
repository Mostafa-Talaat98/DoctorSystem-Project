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
