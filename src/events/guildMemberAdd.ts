import { EmbedBuilder, Events, GuildMember } from 'discord.js';
import { Bot } from '../core/bot';
import { logger } from '../modules/logger';
import { BaseEvent } from '../types/event';

/**
 * Event handler for Discord guild member add events
 */
export default class GuildMemberAddEvent extends BaseEvent<typeof Events.GuildMemberAdd> {
  constructor() {
    super(Events.GuildMemberAdd, false);
  }

  /**
   * Send a welcome message to the new member and refresh the member count
   * @param interaction - The interaction received from Discord
   */
  public async execute(member: GuildMember): Promise<void> {
    try {
      // Get the welcome channel - you'll need to adjust this to your specific setup
      // This assumes there's a channel named "welcome" in the guild
      const welcomeChannel = member.guild.channels.cache.find(
        (channel) => channel.name === 'welcome' && channel.isTextBased()
      );

      if (welcomeChannel && welcomeChannel.isTextBased()) {
        // Create a personalized welcome message
        const joinEmbed = new EmbedBuilder()
          .setColor(0x2ecc71)
          .setTitle('New member joined!')
          .setDescription(`**${member.user.tag}** is one of us now!`)
          .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
          .addFields(
            {
              name: 'Account created on',
              value: member.user.createdAt.toLocaleDateString('en-US'),
              inline: true,
            },
            { name: 'User ID', value: member.id, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: `Now there are ${member.guild.memberCount} members` });

        await welcomeChannel.send({ embeds: [joinEmbed] });
        logger.info(`New member joined: ${member.user.username} (${member.id})`);
      } else {
        logger.warn(`Could not find welcome channel for new member: ${member.user.username}`);
      }
      // Refresh the member count
      Bot.getInstance().refreshMembersCount();
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error welcoming new member ${member.user.username}: ${error.message}`);
      } else {
        logger.error(`Unknown error welcoming new member ${member.user.username}`);
      }
    }
  }
}
