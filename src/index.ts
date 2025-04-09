import { Bot } from './core/bot';
// Client export for use in other files
export const client = Bot.getInstance().client;

/**
 * Main entry point for the bot
 * Initializes the bot and handles any errors during startup
 */
Bot.getInstance()
  .init()
  .catch((error) => {
    console.error('Failed to initialize bot:', error);
    process.exit(1);
  });
