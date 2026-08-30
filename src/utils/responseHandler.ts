// @ts-nocheck
// Standard success response
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Standard error response
export const errorResponse = (res, error, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: error.message || error,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Paginated response
export const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

