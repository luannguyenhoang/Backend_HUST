const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi server nội bộ';
  
  res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = errorHandler;

