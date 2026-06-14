# Discord setup guide

This template follows the current [discord.js guide](https://discordjs.guide/) and [Discord application commands documentation](https://docs.discord.com/developers/interactions/application-commands).

## 1. Create the application

1. Open the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** and choose a name.
3. Open **Bot** in the sidebar and click **Reset Token** to generate a bot token.
4. Copy the token into `.env` as `DISCORD_TOKEN`.

## 2. Copy IDs

| Variable | Where to find it |
|----------|------------------|
| `DISCORD_CLIENT_ID` | **General Information** → Application ID |
| `DISCORD_GUILD_ID` | Enable Developer Mode in Discord → right-click your server → **Copy Server ID** |

## 3. Enable privileged intents

This template uses:

- `Guilds` (required by discord.js)
- `GuildMembers` (for welcome/farewell events and member count presence)

In the Developer Portal, open **Bot** → **Privileged Gateway Intents** and enable:

- **Server Members Intent**

You do **not** need **Message Content Intent** unless you add classic message handlers later.

If intents are missing, the gateway closes with close code `4014` (Disallowed Intents). See the [Gateway intents documentation](https://docs.discord.com/developers/events/gateway#privileged-intents).

## 4. Invite the bot

Generate an invite URL with the `bot` and `applications.commands` scopes:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2147552256&scope=bot%20applications.commands
```

Replace `YOUR_CLIENT_ID` with your application ID. Adjust `permissions` if your bot needs extra capabilities.

## 5. Deploy slash commands

Slash command **definitions** are deployed separately from the running bot, as recommended by the [discord.js deploying commands guide](https://discordjs.guide/legacy/app-creation/deploying-commands):

```bash
pnpm deploy:commands
```

- **Guild commands** (default): update instantly — best for development.
- **Global commands**: `pnpm deploy:commands:global` — propagate to every server the app is installed in (can take up to an hour).

Re-run deploy only when command names, descriptions, or options change.

## 6. Start the bot

```bash
pnpm dev
```

For production:

```bash
pnpm build
pnpm start
```

## Requirements

[discord.js 14.26+](https://discord.js.org/) currently requires **Node.js 22.12.0 or newer**.
