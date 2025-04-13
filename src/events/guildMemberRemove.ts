import { EmbedBuilder, Events, GuildMember } from 'discord.js';
import { Bot } from '../core/bot';
import { logger } from '../modules/logger';
import { BaseEvent } from '../types/event';

/**
 * Event handler for Discord guild member remove events
 */
export default class GuildMemberRemoveEvent extends BaseEvent<typeof Events.GuildMemberRemove> {
  constructor() {
    super(Events.GuildMemberRemove, false);
  }

  /**
   * Send a farewell message to the member leaving and refresh the member count
   * @param member - The member who is leaving the guild
   */
  public async execute(member: GuildMember): Promise<void> {
    try {
      // Get the farewell channel - you'll need to adjust this to your specific setup
      // This assumes there's a channel named "farewell" in the guild
      const farewellChannel = member.guild.channels.cache.find(
        (channel) => channel.name === 'farewell' && channel.isTextBased()
      );

      if (farewellChannel && farewellChannel.isTextBased()) {
        // Create a personalized farewell message
        const farewellEmbed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle('Member left!')
          .setDescription(`**${member.user.tag}** has left the server.`)
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

        await farewellChannel.send({ embeds: [farewellEmbed] });
        logger.info(`Member left: ${member.user.username} (${member.id})`);
      } else {
        logger.warn(`Could not find farewell channel for member: ${member.user.username}`);
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
