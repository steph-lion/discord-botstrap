import path from 'path';
import { describe, expect, it } from 'vitest';
import { loadCommandModules } from '../../../modules/commands/load-commands';

describe('loadCommandModules', () => {
  it('loads built-in commands from src/commands', async () => {
    const commandsPath = path.join(__dirname, '../../../commands');
    const commands = await loadCommandModules(commandsPath);
    const names = commands.map((command) => command.data.name).sort();

    expect(names).toEqual(['help', 'ping', 'test']);
  });

  it('skips files without a default exported class', async () => {
    const commandsPath = path.join(__dirname, '../../../commands');
    const commands = await loadCommandModules(commandsPath);

    for (const command of commands) {
      expect(command.data).toBeDefined();
      expect(typeof command.execute).toBe('function');
    }
  });
});
