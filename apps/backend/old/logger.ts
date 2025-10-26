import winston from 'winston';
import expressWinston from 'express-winston';

expressWinston.requestWhitelist = ['url', 'method', 'httpVersion', 'originalUrl', 'query', 'body'];

const MEGABYTES = 1048576;

export const expressLogger = expressWinston.logger({
  responseWhitelist: ['body'],
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(info => {
          const { req, res } = info.meta as any;
          const error = `${info.error ? ` / ${JSON.stringify(info.error)}` : ''}`;
          return `[${info.timestamp}] ${req.method} ${req.url} ${res.statusCode}${error}`;
        })
      )
    }),
    new winston.transports.File({
      filename: `./http-log.log`,
      maxsize: MEGABYTES * 10,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json())
    })
  ],
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
  skip: req => req.method === 'OPTIONS',
  dynamicMeta: (req, res) => {
    const body = (res as any)?.body || {};
    return {
      user: req.user,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      error: body.error && body.code ? body : null,
      res: { statusCode: res.statusCode }
    };
  }
});
