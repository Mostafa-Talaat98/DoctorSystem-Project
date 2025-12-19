/**
 * @class ApplicationException
 * @extends Error
 *
 * @description
 * Base class for all application-level exceptions.
 * Encapsulates an HTTP status code and optional root cause.
 *
 * @param {string} message - Human-readable error message.
 * @param {number} [statusCode=400] - HTTP status code.
 * @param {unknown} [cause] - Original error or reason.
 */
export class ApplicationException extends Error {
  constructor(message, statusCode = 400, cause) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.statusCode = statusCode;

    // Capture stack trace excluding constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @class BadRequestException
 * @extends ApplicationException
 *
 * @description
 * Represents a 400 Bad Request error.
 * Used when the client sends invalid or malformed data.
 *
 * @param {string} message - Error message.
 * @param {unknown} [cause] - Root cause of the error.
 */
export class BadRequestException extends ApplicationException {
  constructor(message, cause) {
    super(message, 400, cause);
  }
}
/**
 * @class BadRequestException
 * @extends ApplicationException
 *
 * @description
 * Represents a 400 Validation Request error.
 * Used when the client sends invalid or malformed data.
 *
 * @param {string} message - Error message.
 * @param {unknown} [cause] - Root cause of the error.
 */
export class ValidationException extends ApplicationException {
  constructor(message, cause) {
    super(message, 400, cause);
  }
}

/**
 * @class ConflictException
 * @extends ApplicationException
 *
 * @description
 * Represents a 409 Conflict error.
 * Used when a resource already exists or violates uniqueness.
 *
 * @param {string} message - Error message.
 * @param {unknown} [cause] - Root cause of the error.
 */
export class ConflictException extends ApplicationException {
  constructor(message, cause) {
    super(message, 409, cause);
  }
}

/**
 * @class NotFoundException
 * @extends ApplicationException
 *
 * @description
 * Represents a 404 Not Found error.
 * Used when a requested resource cannot be located.
 *
 * @param {string} [message="Not Found"] - Error message.
 * @param {unknown} [cause] - Root cause of the error.
 */
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




