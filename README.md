# Discord Botstrap

![Botstrap Logo](.github/images/botstrap.png)

<div align="center">

![Build Status](https://github.com/steph-lion/discord-botstrap/actions/workflows/ci.yml/badge.svg) ![Test Coverage](https://codecov.io/gh/steph-lion/discord-botstrap/branch/master/graph/badge.svg) ![Discord.js Version](https://img.shields.io/npm/v/discord.js?label=discord.js) ![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D22.12-339933?logo=nodedotjs)

</div>

**discord-botstrap** is a TypeScript template for building a [discord.js](https://discord.js.org/) bot with a modular command/event architecture, strict environment validation, structured logging, tests, Docker, and CI.

## Key Features

- **discord.js 14** with slash commands, embeds, and REST-based command deployment
- **TypeScript 6** with strict typing
- **Zod** for environment validation
- **Pino** structured logging (pretty in dev, JSON in production)
- **tsx** for fast local development
- **Vitest** unit tests and **GitHub Actions** CI
- **Docker** support for production runs

## Requirements

- Node.js **>= 22.12.0** (required by discord.js 14.26+)
- [pnpm](https://pnpm.io/)
- Docker (optional)

> **Discord API note (Feb 2026):** permissions such as `PIN_MESSAGES`, `CREATE_GUILD_EXPRESSIONS`, and `CREATE_EVENTS` were split from broader permissions. This template does not use those features by default.

## Quick start

1. **Use this template** on GitHub or clone the repository:

   ```bash
   git clone https://github.com/steph-lion/discord-botstrap.git
   cd discord-botstrap
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Fill in `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, and `DISCORD_GUILD_ID`.

4. **Set up Discord** (intents, invite URL, scopes): see [docs/DISCORD_SETUP.md](./docs/DISCORD_SETUP.md).

5. **Deploy slash commands** (run when command definitions change):

   ```bash
   pnpm deploy:commands
   ```

   For production-wide commands: `pnpm deploy:commands:global`

6. **Run the bot:**

   ```bash
   pnpm dev
   ```

   Production:

   ```bash
   pnpm build
   pnpm start
   ```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start bot with hot reload (`tsx watch`) |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run compiled bot |
| `pnpm deploy:commands` | Register guild slash commands (instant) |
| `pnpm deploy:commands:global` | Register global slash commands |
| `pnpm typecheck` | Type-check without emitting files |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest tests |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm format` | Format with Prettier |

## Adding features

See [docs/ADDING_COMMANDS.md](./docs/ADDING_COMMANDS.md) for how to add commands, events, cooldowns, and owner-only restrictions.

## Running with Docker

```bash
docker compose build
docker compose up
```

Deploy commands before or after the first container start:

```bash
pnpm deploy:commands
```

The container runs with `NODE_ENV=production` and emits JSON logs to stdout.

## Linting and formatting

```bash
pnpm lint
pnpm format
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).
