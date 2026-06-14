import { Events, Interaction, MessageFlags } from 'discord.js';
import { getCooldownRemaining, setCooldown } from '../modules/commands/cooldowns';
import { logger } from '../modules/logger';
import { BaseEvent } from '../types/event';

/**
 * Event handler for Discord interaction create events
 */
export default class InteractionCreateEvent extends BaseEvent<typeof Events.InteractionCreate> {
  constructor() {
    super(Events.InteractionCreate, false);
  }

  /**
   * Execute the appropriate command when an interaction is received
   * @param interaction - The interaction received from Discord
   */
  public async execute(interaction: Interaction): Promise<void> {
    try {
      if (!interaction.isChatInputCommand()) return;

      const commandName = interaction.commandName;
      const command = interaction.client.commands.get(commandName);

      if (!command) {
        logger.warn(`Command ${commandName} not found`);
        await interaction.reply({
          content: 'This command does not exist.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (command.disabled) {
        await interaction.reply({
          content: 'This command is currently disabled.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (command.ownerOnly) {
        const ownerId = interaction.guild?.ownerId;
        if (!ownerId || interaction.user.id !== ownerId) {
          await interaction.reply({
            content: 'Only the server owner can use this command.',
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }

      if (command.cooldown) {
        const cooldownKey = `${interaction.user.id}:${command.data.name}`;
        const remainingSeconds = getCooldownRemaining(cooldownKey);

        if (remainingSeconds !== null) {
          await interaction.reply({
            content: `Please wait ${remainingSeconds}s before using /${command.data.name} again.`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        setCooldown(cooldownKey, command.cooldown);
      }

      await command.execute(interaction);
      logger.trace(`Command (/${commandName}) executed by ${interaction.user.id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error executing command: ${error.message}`);
      } else {
        logger.error('Unknown error executing command');
      }

      try {
        const errorMessage =
          'An error occurred while executing the command. Please try again later.';
        if (interaction.isChatInputCommand()) {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: errorMessage,
              flags: MessageFlags.Ephemeral,
            });
          } else {
            await interaction.reply({
              content: errorMessage,
              flags: MessageFlags.Ephemeral,
            });
          }
        }
      } catch (replyError: unknown) {
        if (replyError instanceof Error) {
          logger.error(replyError, 'Could not reply to interaction');
        }
      }
    }
  }
}
