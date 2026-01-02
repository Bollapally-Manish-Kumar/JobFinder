/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error responses
 */

export const errorHandler = (err, req, res, next) => {
  console.error('=====================================');
  console.error('ERROR CAUGHT BY ERROR HANDLER:');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('=====================================');

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'A record with this value already exists.'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found.'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired.'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred.' 
      : err.message
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
