/**
 * @description Sends a standardized success response
 * @param {Object} params
 * @param {Response} params.res - Express response object
 * @param {number} [params.statusCode=200] - HTTP status code
 * @param {string} [params.message="Done"] - Response message
 * @param {string|Object} [params.info] - Optional additional info
 * @param {Object} [params.data] - Response data
 * @returns {Response} Express response
 */
export const successResponse = ({ res, statusCode = 200, message = 'Done', info, data }) => {
  return res.status(statusCode).json({
    message,
    info,
    statusCode,
    data,
  });
};
