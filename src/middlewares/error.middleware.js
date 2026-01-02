import mongoose from 'mongoose';
import { ApiError } from '../utilities/APIError.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;

    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, error?.errors || [], error.stack);
  }

  console.error('--- BACKEND ERROR START ---');
  console.dir(err, { depth: null });
  console.error('--- BACKEND ERROR END ---');

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' ||
    process.env.MODE === 'development'
      ? { stack: error.stack }
      : {}),
  };

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
