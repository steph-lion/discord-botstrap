import path from 'path';
import { REST, Routes } from 'discord.js';
import { loadCommandModules } from '../modules/commands/load-commands';
import { env } from '../modules/environment';
import { logger } from '../modules/logger';

const deployGlobal = process.argv.includes('--global');

const deployCommands = async (): Promise<void> => {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commands = await loadCommandModules(commandsPath);

  if (commands.length === 0) {
    logger.warn('No commands found to deploy');
    return;
  }

  const body = commands.map((command) => command.data.toJSON());
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

  logger.info(
    `Deploying ${body.length} command(s) as ${deployGlobal ? 'global' : 'guild'} commands...`
  );

  if (deployGlobal) {
    const data = (await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), {
      body,
    })) as unknown[];
    logger.info(`Successfully deployed ${data.length} global application command(s)`);
    return;
  }

  const data = (await rest.put(
    Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
    { body }
  )) as unknown[];
  logger.info(`Successfully deployed ${data.length} guild application command(s)`);
};

deployCommands().catch((error: unknown) => {
  if (error instanceof Error) {
    logger.error(error, `Failed to deploy commands: ${error.message}`);
  } else {
    logger.error('Failed to deploy commands due to an unknown error');
  }
  process.exit(1);
});
