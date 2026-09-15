const { resolveAdmin } = require("./auth.middleware");

/**
 * Decodes a token when one is present but never rejects the request.
 * Lets public endpoints return extra data (drafts, scheduled posts) to a
 * logged-in admin without a second set of routes.
 */
module.exports.optionalAuth = async (req, res, next) => {
  const admin = await resolveAdmin(req);
  if (admin) req.admin = admin;
  next();
};
