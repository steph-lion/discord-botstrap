import { ActivityType, Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
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
    // Initialize client with all necessary intents
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildMembers,
      ],
    });

    // Create a collection for commands
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

      // Wait for internet connection before proceeding
      await waitForInternetConnection();

      // Register commands
      await this.registerCommands();

      // Register events
      await this.registerEvents();

      // Login the client
      await this.client.login(env.DISCORD_TOKEN);

      // Set the bot's presence to say how many members are in the server
      await this.refreshMembersCount();
      logger.info(`Bot (${this.client.user?.tag}) is up and running!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error during initialization: ${error.message}`, error);
      } else {
        logger.error('Unknown error during initialization');
      }
      process.exit(1);
    }
  }

  /**
   * Register commands from the commands directory
   */
  private async registerCommands(): Promise<void> {
    try {
      logger.debug('Registering commands...');
      const commandsPath = path.join(__dirname, '..', 'commands');
      const commandFiles = fs
        .readdirSync(commandsPath)
        .filter(
          (file) =>
            (file.endsWith('.js') || file.endsWith('.ts')) &&
            file !== 'index.js' &&
            file !== 'index.ts'
        );
      const commands: Record<string, unknown>[] = [];

      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
          // Using dynamic import
          const commandModule = await import(filePath);
          const CommandClass = commandModule.default;

          // Skip if the command module doesn't export a default class
          if (!CommandClass || typeof CommandClass !== 'function') {
            logger.warn(`Command at ${filePath} doesn't export a default class`);
            continue;
          }

          // Instantiate the command class
          const command = new CommandClass();

          // Check if command is valid
          if (!command.data || !command.execute) {
            logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
            continue;
          }

          // Set the command in the collection
          this.client.commands.set(command.data.name, command);
          commands.push(command.data.toJSON());
        } catch (importError: unknown) {
          if (importError instanceof Error) {
            logger.error(
              `Error importing command at ${filePath}: ${importError.message}`,
              importError
            );
          } else {
            logger.error(`Unknown error importing command at ${filePath}`);
          }
        }
      }

      // Deploy commands to Discord
      if (commands.length > 0) {
        const rest = new REST().setToken(env.DISCORD_TOKEN);
        await rest.put(
          Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
          {
            body: commands,
          }
        );

        logger.debug(
          `Successfully registered ${commands.length} command(s) from ${commands.length} file(s)!`
        );
      } else {
        logger.warn('No commands were registered');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error registering commands: ${error.message}`, error);
      } else {
        logger.error('Unknown error registering commands');
      }
      throw error; // Rethrow to be caught by the main init function
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
          // Using dynamic import
          const eventModule = await import(filePath);
          const EventClass = eventModule.default;

          // Skip if the event module doesn't export a default class
          if (!EventClass || typeof EventClass !== 'function') {
            logger.warn(`Event at ${filePath} doesn't export a default class`);
            continue;
          }

          // Instantiate the event class
          const event = new EventClass();

          // Skip if the event is not an instance of BaseEvent
          if (!(event instanceof BaseEvent)) {
            logger.warn(`Event at ${filePath} is not an instance of BaseEvent`);
            continue;
          }

          // Register the event with the client
          if (event.once) {
            this.client.once(event.name, (...args) => event.execute(...args));
          } else {
            this.client.on(event.name, (...args) => event.execute(...args));
          }
        } catch (importError: unknown) {
          if (importError instanceof Error) {
            logger.error(
              `Error importing event at ${filePath}: ${importError.message}`,
              importError
            );
          } else {
            logger.error(`Unknown error importing event at ${filePath}`);
          }
        }
      }

      logger.debug(
        `Successfully registered ${eventFiles.length} event(s) from ${eventFiles.length} file(s)!`
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error registering events: ${error.message}`, error);
      } else {
        logger.error('Unknown error registering events');
      }
      throw error; // Rethrow to be caught by the main init function
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
