import { BadRequestException } from '../../utils/response/error.response.js';

export const validateRequest = (schema) => (req, res, next) => {
  const data = { ...req.body, ...req.query, ...req.params };
  console.log('Validating data:', JSON.stringify(data, null, 2));
  if (req.file || req.files?.length) {
    data.file = req.file || req.files;
  }
  const result = schema.validate(data, { abortEarly: false });
  if (result.error) {
    const errorMessages = result.error.details.map((detail) => detail.message);
    throw new BadRequestException('Validation Error', errorMessages);
  }

  next();
};

export const validateCookies = (schema) => (req, res, next) => {
  const cookies = { ...req.cookies };
  const result = schema.validate(cookies, { abortEarly: false });
  if (result.error) {
    const errorMessages = result.error.details.map((detail) => detail.message);
    throw new BadRequestException('Cookie Validation Error', errorMessages);
  }

  next();
};
