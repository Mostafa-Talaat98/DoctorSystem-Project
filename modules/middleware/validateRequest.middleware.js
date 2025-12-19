import { BadRequestException } from "../../utils/response/error.response.js";

const validateRequest = (schema) => (req, res, next) => {
  const data = { ...req.body, ...req.query, ...req.params };
  if (req.file || req.files?.length) {
    data.file = req.file || req.files;
  }
  const result = schema.validate(data, { abortEarly: false });
  if (result.error) {
    const errorMessages = result.error.details.map((detail) => detail.message);
    throw new BadRequestException("Validation Error", errorMessages);
  }

  next();
};

export default validateRequest;
