export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  console.error(err.message);
  res.status(err.statusCode).json({
    status: "fail",
    message: err.message,
  });
};
