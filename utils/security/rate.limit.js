import rateLimit from "express-rate-limit";

export const createRateLimiter = (max, windowMs) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
      error: "Too many requests, please try again later",
    },
  });
};