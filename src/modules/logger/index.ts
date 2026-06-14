import dotenv from 'dotenv';
import { pino } from 'pino';

dotenv.config();

const logLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
type LogLevel = (typeof logLevels)[number];

const resolveLogLevel = (): LogLevel => {
  const level = process.env.LOG_LEVEL;
  if (level && logLevels.includes(level as LogLevel)) {
    return level as LogLevel;
  }
  return 'info';
};

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: resolveLogLevel(),
  base: {
    service: 'discord-botstrap',
    env: process.env.NODE_ENV ?? 'development',
  },
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
        },
      }
    : undefined,
});

export { logger };
