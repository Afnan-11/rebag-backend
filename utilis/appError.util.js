export default class AppError extends Error {
    constructor(message, status) {
      super(message);
  
      this.status = status;
      this.isOperational = true;
      this.statusText = `${status}`.startsWith("4") ? "FAIL" : "ERROR";
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  