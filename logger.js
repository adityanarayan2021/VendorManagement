import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
//   defaultMeta: { service: 'book-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Log to a file
    new winston.transports.File({ filename: 'logs/combined.log' }),
    // Log errors file
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  ]
});

export default logger;
