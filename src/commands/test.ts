import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { BaseCommand } from '../types/command';

/**
 * Simple test command to check bot status
 */
export default class TestCommand extends BaseCommand {
  constructor() {
    // Create command metadata
    const data = new SlashCommandBuilder()
      .setName('test')
      .setDescription('Test command to check bot status');

    // Initialize base command with metadata and options
    super(data, {
      category: 'Utility',
      longDescription: "A test command to check the bot's status",
    });
  }

  /**
   * Execute the test command
   * @param interaction - The interaction object from Discord
   */
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Reply with a simple message
      await interaction.reply({
        content: 'Bot up and running, hit me up with /help for more commands!',
        ephemeral: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error executing ping command: ${error.message}`);
      } else {
        console.error('Unknown error executing ping command');
      }
    }
  }
}
