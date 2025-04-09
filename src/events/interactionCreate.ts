import { Events, Interaction } from 'discord.js';
import { logger } from '../modules/logger';
import { BaseEvent } from '../types/event';

/**
 * Event handler for Discord interaction create events
 */
export default class InteractionCreateEvent extends BaseEvent<typeof Events.InteractionCreate> {
  constructor() {
    // Initialize with event name and once=false since we want to handle all interactions
    super(Events.InteractionCreate, false);
  }

  /**
   * Execute the appropriate command when an interaction is received
   * @param interaction - The interaction received from Discord
   */
  public async execute(interaction: Interaction): Promise<void> {
    try {
      // Handle only chat input commands (slash commands)
      if (!interaction.isChatInputCommand()) return;

      const commandName = interaction.commandName;

      // Get the command from the client's commands collection
      const command = interaction.client.commands.get(commandName);

      // Check if command exists
      if (!command) {
        logger.warn(`Command ${commandName} not found`);
        await interaction.reply({
          content: 'This command does not exist.',
          ephemeral: true,
        });
        return;
      }

      // Check if command is disabled
      if (command.disabled) {
        await interaction.reply({
          content: 'This command is currently disabled.',
          ephemeral: true,
        });
        return;
      }

      // Execute the command
      await command.execute(interaction);
      logger.trace(`Command (/${commandName}) executed by ${interaction.user.id}`);
    } catch (error: unknown) {
      // Handle errors during command execution
      if (error instanceof Error) {
        logger.error(`Error executing command: ${error.message}`);
      } else {
        logger.error('Unknown error executing command');
      }
      // Reply to the user with an error message
      try {
        const errorMessage =
          'An error occurred while executing the command. Please try again later.';
        if (interaction.isChatInputCommand()) {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
          } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
          }
        }
      } catch (replyError: unknown) {
        // If we can't reply to the interaction, log the error
        if (replyError instanceof Error) {
          logger.error(`Could not reply to interaction:`, replyError);
        }
      }
    }
  }
}
