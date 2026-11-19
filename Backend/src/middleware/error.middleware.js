/** Purpose: Return consistent responses for unknown routes and unexpected errors. */
const notFound = (req, res) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Express recognizes this as an error handler by its four-parameter signature.
const errorHandler = (error, req, res, _next) => {
  console.error(error);
  const statusCode = error.statusCode || error.status || 500;
  res.status(statusCode).json({
    message:
      statusCode >= 500 ? "Internal server error." : error.message || "Request failed.",
  });
};

module.exports = { notFound, errorHandler };
