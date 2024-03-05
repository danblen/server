import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const logger = winston.createLogger({
  level: 'info', // 设置日志级别
  format: winston.format.json(), // 设置日志格式为 JSON
  transports: [
    // new winston.transports.Console(), // 输出到控制台
    // new winston.transports.FileTransportOptions({
    //   filename: 'logs/app-%DATE%.log',
    //   datePattern: 'YYYY-MM-DD',
    // }),
    // new winston.transports.File({
    //   filename: 'logs/app-%DATE%.log',
    //   datePattern: 'YYYY-MM-DD',
    // }),
    new DailyRotateFile({
      filename: 'logs/%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

export const log = (req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
};
export const logerr = (err, req, res, next) => {
  logger.error(err.message);
  res.status(500).send('Something went wrong!');
};
