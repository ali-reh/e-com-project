// Global error handler middleware
export const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Supabase specific errors
  if (error.status) {
    return res.status(error.status).json({
      error: error.message,
      code: error.code
    });
  }

  // Database validation errors
  if (error.constraint) {
    return res.status(400).json({
      error: 'Database constraint violation',
      constraint: error.constraint
    });
  }

  // Default error
  res.status(error.statusCode || 500).json({
    error: error.message || 'Internal server error'
  });
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
