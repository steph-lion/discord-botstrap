# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-14

### Added

- Slash command deploy script (`pnpm deploy:commands`, `pnpm deploy:commands:global`)
- `/help` and `/ping` commands with cooldown support
- Owner-only command flag on interactions
- Discord setup guide (`docs/DISCORD_SETUP.md`) and command authoring guide (`docs/ADDING_COMMANDS.md`)
- Node toolchain files (`.nvmrc`, `.env.example`)
- Vitest test suite with coverage reporting in CI

### Changed

- **Breaking:** Node.js `>=22.12.0` (required by discord.js 14.26+)
- Upgraded to TypeScript 6, ESLint 10, Zod 4, Pino 10, and discord.js 14.26
- Migrated tests from Jest to Vitest
- Commands load in memory at runtime; deployment is a separate REST step
- Trimmed gateway intents to `Guilds` and `GuildMembers`
- Logger respects `LOG_LEVEL`; pretty output only in development
- Modernized GitHub Actions CI and Dependabot grouping
- Refreshed README and project documentation

### Fixed

- Guild member remove event log messages
- ESLint Node globals and `dist/` ignore pattern
- CI workflow: install pnpm before Node cache setup

[1.0.0]: https://github.com/steph-lion/discord-botstrap/compare/v0.1.0...v1.0.0
