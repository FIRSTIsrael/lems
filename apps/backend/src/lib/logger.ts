import * as path from 'path';
import pino from 'pino';
import dayjs from 'dayjs';
import 'pino-pretty';
import 'pino-roll';

const logsDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

function humanReadableTimeFunction(): string {
  return `,"time":"${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')}"`;
}

const fileTransport = pino.transport({
  target: 'pino-roll',
  options: {
    file: path.join(logsDir, 'app'),
    size: '100m',
    frequency: 'daily',
    mkdir: true,
    extension: '.log',
    dateFormat: 'yyyy-MM-dd'
  }
});

const consoleTransport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'yyyy-mm-dd HH:MM:ss.l',
    ignore: 'pid,hostname',
    singleLine: false
  }
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    timestamp: humanReadableTimeFunction,
    formatters: {
      level: label => {
        return { level: label };
      }
    }
  },
  pino.multistream([
    { level: 'info', stream: fileTransport },
    { level: 'info', stream: consoleTransport }
  ])
);

export default logger;
