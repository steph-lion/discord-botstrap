import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { logger } from '../modules/logger';
import { BaseCommand } from '../types/command';

/**
 * Example command demonstrating cooldown handling.
 */
export default class PingCommand extends BaseCommand {
  constructor() {
    const data = new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with Pong');

    super(data, {
      category: 'Utility',
      longDescription: 'Simple latency check with a 3 second per-user cooldown',
      cooldown: 3,
    });
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const latency = Date.now() - interaction.createdTimestamp;
      await interaction.reply({
        content: `Pong! (${latency}ms)`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(error, `Error executing ping command: ${error.message}`);
      } else {
        logger.error('Unknown error executing ping command');
      }
    }
  }
}
