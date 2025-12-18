const validateRequest = (registerSchema) => (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body ? req.body : {}, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const validationErrors = error.details.map((detail) => ({
      source: 'body',
      field: detail.context.key,
      message: detail.message.replace(/['"]/g, ''),
    }));

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed for request body.',
      errors: validationErrors,
    });
  }
  console.log(value);
  req.body = value;

  next();
};

export default validateRequest;
