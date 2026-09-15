const { rateLimit } = require("express-rate-limit");

const limiter = (limit, windowMinutes, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message },
  });

/** Brute-force protection for admin sign-in. */
exports.loginLimiter = limiter(10, 15, "Too many sign-in attempts. Try again in a few minutes.");

/** Contact, newsletter, likes, shares and ad counters. */
exports.publicWriteLimiter = limiter(60, 10, "Too many requests. Please slow down.");
