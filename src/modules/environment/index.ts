import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../logger';

// Load environment variables from .env file
dotenv.config();

// Define schema for environment variables
const envSchema = z.object({
  // Common configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Logger configuration
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // Discord bot configuration
  DISCORD_TOKEN: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_GUILD_ID: z.string(),
});

// Validate and extract environment variables
const validateEnv = (): z.infer<typeof envSchema> => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Invalid environment variables:', JSON.stringify(error.format(), null, 2));
      process.exit(1);
    }
    logger.error('Unknown error during environment validation');
    throw error;
  }
};

// Export validated environment variables
export const env = validateEnv();

// Export the type for use elsewhere
export type Env = z.infer<typeof envSchema>;
