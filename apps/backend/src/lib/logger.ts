import * as path from 'path';
import pino from 'pino';
import 'pino-pretty';
import 'pino-roll';

const logsDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

function getHumanReadableTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
}

function humanReadableTimeFunction(): string {
  return `,"time":"${getHumanReadableTime()}"`;
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
