import { pino } from 'pino';

const logger = pino({
  level: 'trace',
  transport: {
    target: 'pino-pretty',
  },
});

export { logger };
