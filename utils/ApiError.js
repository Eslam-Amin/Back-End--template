class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.isOperational = true;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? "Failed" : "Error";
    this.success = false;
  }
}

module.exports = ApiError;
