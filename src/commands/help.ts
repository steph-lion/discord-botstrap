import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { logger } from '../modules/logger';
import { BaseCommand } from '../types/command';

/**
 * Lists available slash commands and their descriptions.
 */
export default class HelpCommand extends BaseCommand {
  constructor() {
    const data = new SlashCommandBuilder()
      .setName('help')
      .setDescription('List available bot commands');

    super(data, {
      category: 'Utility',
      longDescription: 'Shows all registered slash commands grouped by category',
    });
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const commands = [...interaction.client.commands.values()].sort((a, b) =>
        a.data.name.localeCompare(b.data.name)
      );

      if (commands.length === 0) {
        await interaction.reply({
          content: 'No commands are registered yet.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const grouped = new Map<string, typeof commands>();
      for (const command of commands) {
        const category = command.category ?? 'General';
        const bucket = grouped.get(category) ?? [];
        bucket.push(command);
        grouped.set(category, bucket);
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('Available commands')
        .setDescription('Use slash commands directly in Discord.')
        .setTimestamp();

      for (const [category, categoryCommands] of [...grouped.entries()].sort(([a], [b]) =>
        a.localeCompare(b)
      )) {
        const value = categoryCommands
          .map((command) => {
            const description = command.longDescription ?? command.data.description;
            return `**/${command.data.name}** — ${description}`;
          })
          .join('\n');

        embed.addFields({ name: category, value });
      }

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(error, `Error executing help command: ${error.message}`);
      } else {
        logger.error('Unknown error executing help command');
      }
    }
  }
}
