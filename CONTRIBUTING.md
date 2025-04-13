# Contributing to Discord Botstrap

Thank you for your interest in contributing to **Discord-Botstrap**! This document outlines the guidelines for contributing to the project.

---

## How to Contribute

1. **Fork the repository**

   - Create a fork of this repository on your GitHub account.
   - Clone the fork locally to work on your changes.

2. **Create a dedicated branch**

   - Always create a new branch for your changes, based on `master`.
     Example:
     ```bash
     git checkout -b feat/my-new-feature
     ```

3. **Make your changes**

   - Ensure your changes are relevant and follow the project's scope.
   - Test your changes locally before submitting a pull request (PR).

4. **Open a Pull Request (PR)**
   - Submit your PR to the `master` branch of this repository.
   - The PR title must start with one of the following keywords: `Add`, `Fix`, `Refactor`, etc.
   - Ensure your PR passes all GitHub Actions checks and is approved by the repository owner.

---

## Commit Guidelines

To maintain a clean and readable commit history, follow these conventions:

- Use the format:

  ```
  <type>: <Description starts with a capital letter>
  ```

  Examples:

  - `feat: Add new /ping command`
  - `fix: Resolve issue with guildMemberAdd event`
  - `refactor: Simplify bot initialization logic`
  - `chore: Update dependencies`

- **Accepted types:**
  - `feat`: For new features.
  - `fix`: For bug fixes.
  - `refactor`: For code changes that neither fix a bug nor add a feature.
  - `chore`: For maintenance tasks (e.g., dependency updates, configuration changes).

---

## Pull Request Guidelines

- The PR title must start with one of the following keywords: `Add`, `Fix`, `Refactor`, etc.
- The PR must pass all GitHub Actions checks (e.g., linting, tests).
- The PR must be approved by the repository owner before being merged.

---

## Issues

- Suggestions for new features or improvements are welcome.
- Remember, this project is a **template** for Discord bots. Suggestions should be generic and beneficial for all users, not specific to individual use cases.

Examples of acceptable issues:

- "Add an example command for role management."
- "Improve documentation for initial setup."
- "Integrate advanced logging system."

---

Thank you for contributing! If you have any questions, feel free to open an issue or contact the repository owner.
