import logger from '../logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);
  console.error(err.stack);

  // Customize error responses based on the type of error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // Generic server error
  res.status(500).json({ message: 'Something went wrong!' });
};

export default errorHandler;