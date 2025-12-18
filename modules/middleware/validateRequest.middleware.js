const validateRequest = (schema) => (req, res, next) => {
  const data = { ...req.body, ...req.query, ...req.params };
  if (req.file || req.files?.length) {
    data.file = req.file || req.files;
  }
  const result = schema.validate(data, { abortEarly: false });
  if (result.error) {
    const errorMessages = result.error.details.map((detail) => detail.message);

    const customError = new Error('Validation Error');
    customError.cause = 400;

    customError.details = errorMessages;

    return next(customError);
  }

  next();
};

export default validateRequest;
