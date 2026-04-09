const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  if (res.headersSent) {
    return next(error);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}),
  });
};

module.exports = errorHandler;
