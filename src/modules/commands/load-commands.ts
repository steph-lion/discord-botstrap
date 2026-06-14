import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import { Command } from '../../types/command';

const isCommandFile = (file: string): boolean =>
  (file.endsWith('.js') || file.endsWith('.ts')) && file !== 'index.js' && file !== 'index.ts';

/**
 * Load command classes from a directory and return instantiated commands.
 */
export const loadCommandModules = async (commandsDir: string): Promise<Command[]> => {
  const commands: Command[] = [];
  const commandFiles = fs.readdirSync(commandsDir).filter(isCommandFile);

  for (const file of commandFiles) {
    const filePath = path.join(commandsDir, file);

    try {
      const commandModule = await import(filePath);
      const CommandClass = commandModule.default;

      if (!CommandClass || typeof CommandClass !== 'function') {
        logger.warn(`Command at ${filePath} doesn't export a default class`);
        continue;
      }

      const command: Command = new CommandClass();

      if (!command.data || !command.execute) {
        logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
        continue;
      }

      commands.push(command);
    } catch (importError: unknown) {
      if (importError instanceof Error) {
        logger.error(importError, `Error importing command at ${filePath}: ${importError.message}`);
      } else {
        logger.error(`Unknown error importing command at ${filePath}`);
      }
    }
  }

  return commands;
};
