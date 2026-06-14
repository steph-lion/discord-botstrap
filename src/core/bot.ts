import { ActivityType, Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { loadCommandModules } from '../modules/commands/load-commands';
import { env } from '../modules/environment';
import { logger } from '../modules/logger';
import { waitForInternetConnection } from '../modules/utils/network';
import { Command } from '../types/command';
import { BaseEvent } from '../types/event';

// Extend Client interface to include commands
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
  }
}

/**
 * Bot class to handle Discord bot initialization and management
 */
export class Bot {
  private static instance: Bot;
  public readonly client: Client;

  private constructor() {
    // Guilds is required; GuildMembers is privileged and needed for member events/count
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    });

    this.client.commands = new Collection<string, Command>();
  }

  /**
   * Get the singleton instance of the bot
   */
  public static getInstance(): Bot {
    if (!Bot.instance) {
      Bot.instance = new Bot();
    }
    return Bot.instance;
  }

  /**
   * Initialize bot and register all commands and events
   */
  public async init(): Promise<void> {
    try {
      logger.info('Initializing bot...');

      await waitForInternetConnection();

      await this.loadCommands();
      await this.registerEvents();

      await this.client.login(env.DISCORD_TOKEN);

      await this.refreshMembersCount();
      logger.info(`Bot (${this.client.user?.tag}) is up and running!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(error, `Error during initialization: ${error.message}`);
      } else {
        logger.error('Unknown error during initialization');
      }
      process.exit(1);
    }
  }

  /**
   * Load commands from disk into the in-memory command collection.
   * Slash command definitions are deployed separately via `pnpm deploy:commands`.
   */
  private async loadCommands(): Promise<void> {
    try {
      logger.debug('Loading commands...');
      const commandsPath = path.join(__dirname, '..', 'commands');
      const commands = await loadCommandModules(commandsPath);

      for (const command of commands) {
        this.client.commands.set(command.data.name, command);
      }

      if (commands.length > 0) {
        logger.debug(`Loaded ${commands.length} command(s) into memory`);
      } else {
        logger.warn('No commands were loaded');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(error, `Error loading commands: ${error.message}`);
      } else {
        logger.error('Unknown error loading commands');
      }
      throw error;
    }
  }

  /**
   * Register event handlers from the events directory
   */
  private async registerEvents(): Promise<void> {
    try {
      logger.debug('Registering events...');
      const eventsPath = path.join(__dirname, '..', 'events');
      const eventFiles = fs
        .readdirSync(eventsPath)
        .filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

      for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        try {
          const eventModule = await import(filePath);
          const EventClass = eventModule.default;

          if (!EventClass || typeof EventClass !== 'function') {
            logger.warn(`Event at ${filePath} doesn't export a default class`);
            continue;
          }

          const event = new EventClass();

          if (!(event instanceof BaseEvent)) {
            logger.warn(`Event at ${filePath} is not an instance of BaseEvent`);
            continue;
          }

          if (event.once) {
            this.client.once(event.name, (...args) => event.execute(...args));
          } else {
            this.client.on(event.name, (...args) => event.execute(...args));
          }
        } catch (importError: unknown) {
          if (importError instanceof Error) {
            logger.error(
              importError,
              `Error importing event at ${filePath}: ${importError.message}`
            );
          } else {
            logger.error(`Unknown error importing event at ${filePath}`);
          }
        }
      }

      logger.debug(`Registered ${eventFiles.length} event handler file(s)`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(error, `Error registering events: ${error.message}`);
      } else {
        logger.error('Unknown error registering events');
      }
      throw error;
    }
  }

  /**
   * Refresh members count
   */
  public async refreshMembersCount(): Promise<void> {
    try {
      const guild = this.client.guilds.cache.get(env.DISCORD_GUILD_ID);
      if (guild) {
        logger.debug(`Refreshing members count for guild: ${guild.name}`);
        const members = await guild.members.fetch();
        const humanCount = members.size;
        this.client.user?.setPresence({
          status: 'online',
          activities: [
            {
              type: ActivityType.Custom,
              name: `There are ${humanCount} members here!`,
            },
          ],
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Failed to refresh members count: ${error.message}`);
      } else {
        logger.error('Unknown error while refreshing members count');
      }
    }
  }
}
