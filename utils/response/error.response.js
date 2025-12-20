
export class ApplicationException extends Error {
  constructor(message, statusCode = 400, cause) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    // Capture stack trace excluding constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestException extends ApplicationException {
  constructor(message, cause) {
    super(message, 400, cause);
  }
}

export class ValidationException extends ApplicationException {
  constructor(message, cause) {
    super(message, 402, cause);
  }
}


export class ConflictException extends ApplicationException {
  constructor(message, cause) {
    super(message, 409, cause);
  }
}

export class NotFoundException extends ApplicationException {
  constructor(message = 'Not Found', cause) {
    super(message, 404, cause);
  }
}


export class InvalidTokenException extends ApplicationException {
  constructor(message = 'The token is invalid or has expired', statusCode = 401, cause) {
    super(message, statusCode, cause);
  }
}

export class UnAuthorizedException extends ApplicationException {
  constructor(message = 'You are not authorized. Please login to continue.', statusCode = 401, cause) {
    super(message, statusCode, cause);
  }
}


export class ForbiddenException extends ApplicationException {
  constructor(message = "You don't have permission to perform this action", statusCode = 403, cause) {
    super(message, statusCode, cause);
  }
}

export class TooManyRequestsException extends ApplicationException {
  constructor(
    message = "Too many requests. Please try again later.",
    cause
  ) {
    super(message, 429, cause);
  }
}



export const globalErrorHandler = (error, req, res, next) => {
  console.error(error);

  res.status(error.statusCode || 500).json({
    error_message: error.message || 'Something Went Wrong',
    name: error.name,
    statusCode: error.statusCode || 500,
    cause: error.cause,
    error_stack: process.env.MOOD === 'development' ? error.stack : undefined,
  });
};
