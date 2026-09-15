/**
 * Final error handler. Client errors keep their message; server errors are
 * logged in full but answered generically so internals never reach the client.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = Number(err.statusCode || err.status) || 500;

  if (statusCode >= 500) {
    console.error("❌ Error:", err);
    return res.status(statusCode).json({ success: false, message: "Something went wrong on our side." });
  }

  res.status(statusCode).json({ success: false, message: err.message || "Request failed" });
};

module.exports = errorHandler;
