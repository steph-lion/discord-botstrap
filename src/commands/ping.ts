import { BaseCommand } from '@/types/command';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

/**
 * Simple ping command to check bot latency
 */
export default class PingCommand extends BaseCommand {
  constructor() {
    // Create command metadata
    const data = new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with the bot latency');

    // Initialize base command with metadata and options
    super(data, {
      category: 'Utility',
      longDescription: "Checks the bot's response time and API latency.",
      cooldown: 5, // 5 seconds cooldown
    });
  }

  /**
   * Execute the ping command
   * @param interaction - The interaction object from Discord
   */
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Calculate roundtrip latency
      const sent = await interaction.reply({ content: 'Pinging...' });
      const message = await sent.fetch();
      const responseTime = message.createdTimestamp - interaction.createdTimestamp;

      // Get WebSocket latency
      const apiLatency = interaction.client.ws.ping;

      await interaction.editReply(
        `🏓 Pong!\n**Roundtrip latency**: ${responseTime}ms\n**API latency**: ${apiLatency}ms`
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error executing ping command: ${error.message}`);
      } else {
        console.error('Unknown error executing ping command');
      }

      // Handle the reply if not already done
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  }
}
