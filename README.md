# Discord Botstrap

![Botstrap Logo](.github/images/botstrap.png)

<div align="center">

![Build Status](https://github.com/steph-lion/discord-botstrap/actions/workflows/ci.yml/badge.svg) ![Test Coverage](https://codecov.io/gh/steph-lion/discord-botstrap/branch/master/graph/badge.svg) ![Discord.js Version](https://img.shields.io/npm/v/discord.js?label=discord.js) ![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=nodedotjs)

</div>

**discord-botstrap** is a TypeScript template project designed to serve as a launchpad for a customizable and scalable bot. It removes all scaffolding concerns and implements best coding practices. It contains a modular structure for commands and events, making it easy to add new features and maintain the codebase.
This template is built on top of [discord.js](https://discord.js.org/) and uses TypeScript for type safety and better development experience. It also includes ESLint and Prettier for code quality and formatting.

## Key Features

- **TypeScript**: Advanced typing for more robust code.
- **ESLint and Prettier**: Ensures consistent and high-quality code style.
- **Docker Support**: Easy and portable execution via Docker containers.
- **Testing**: Includes unit tests with [Jest](https://jestjs.io/) for reliable code.
- **GitHub Actions**: Automated workflows for linting, testing, and building to ensure code quality and reliability for each PR and commit.

## Requirements

- Node.js >= 18
- pnpm (Package Manager)
- Docker (optional, for containerized execution)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/steph-lion/discord-botstrap.git
   cd discord-botstrap
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root of the project and add the following variables:
   ```env
   DISCORD_TOKEN=<your_discord_token>
   DISCORD_CLIENT_ID=<your_client_id>
   DISCORD_GUILD_ID=<your_guild_id>
   ```

## Running Locally

1. Build the project:

   ```bash
   pnpm build
   ```

2. Start the bot:

   ```bash
   pnpm start
   ```

3. For development, use the command:
   ```bash
   pnpm dev
   ```

## Running with Docker

1. Build the Docker image:

   ```bash
   docker-compose build
   ```

2. Start the container:

   ```bash
   docker-compose up
   ```

3. To stop the container:
   ```bash
   docker-compose down
   ```

## Linting and Formatting

This project uses **ESLint** and **Prettier** to maintain consistent code style:

- To lint the code with ESLint:

  ```bash
  pnpm lint
  ```

- To format the code with Prettier:
  ```bash
  pnpm format
  ```

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request and describe your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.
