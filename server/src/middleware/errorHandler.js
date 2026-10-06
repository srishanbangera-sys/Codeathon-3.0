export function errorHandler(err, req, res, _next) {
  console.error('Error:', err.message);
  
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: err.errors
      }
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid token' }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { message: 'Token expired' }
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: { message: 'A record with this value already exists' }
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: { message: 'Record not found' }
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal server error'
    }
  });
}
