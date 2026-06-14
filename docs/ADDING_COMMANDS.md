# Adding commands and events

## Add a slash command

1. Create a file in `src/commands/`, for example `src/commands/ping.ts`.
2. Extend `BaseCommand` and export the class as default.
3. Deploy the updated command definitions to Discord.
4. Restart the bot (or use `pnpm dev` watch mode).

### Example

```typescript
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { logger } from '../modules/logger';
import { BaseCommand } from '../types/command';

export default class PingCommand extends BaseCommand {
  constructor() {
    const data = new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with Pong');

    super(data, {
      category: 'Utility',
      longDescription: 'Simple latency check',
      cooldown: 3,
      ownerOnly: false,
    });
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.reply({ content: 'Pong!', flags: MessageFlags.Ephemeral });
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(error, `Error executing ping command: ${error.message}`);
      }
    }
  }
}
```

### Deploy

```bash
pnpm deploy:commands
```

### Built-in command options

| Option | Effect |
|--------|--------|
| `category` | Grouping shown in `/help` |
| `longDescription` | Extended description shown in `/help` |
| `cooldown` | Per-user cooldown in seconds (enforced in `interactionCreate`) |
| `ownerOnly` | Restricts command to the guild owner |
| `disabled` | Blocks execution with a friendly message |

## Add an event handler

1. Create a file in `src/events/`.
2. Extend `BaseEvent` and export the class as default.
3. Restart the bot — events are loaded automatically on startup (no deploy step).

### Example

```typescript
import { Events } from 'discord.js';
import { BaseEvent } from '../types/event';

export default class ReadyEvent extends BaseEvent<typeof Events.ClientReady> {
  constructor() {
    super(Events.ClientReady, true);
  }

  public async execute(): Promise<void> {
    // Runs once when the bot is ready
  }
}
```

## Project layout

```
src/
  commands/     # Slash command classes
  events/       # Discord event handlers
  core/         # Bot bootstrap
  modules/      # Shared utilities (env, logger, loaders)
  scripts/      # One-off scripts (deploy-commands)
  types/        # Shared TypeScript types
```
