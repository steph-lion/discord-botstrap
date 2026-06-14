# Contributing to Discord Botstrap

Thank you for your interest in contributing to **discord-botstrap**! This document outlines the guidelines for contributing to the project.

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
   - Test your changes locally before submitting a pull request (PR):
     ```bash
     pnpm lint && pnpm typecheck && pnpm test && pnpm build
     ```

4. **Open a Pull Request (PR)**
   - Submit your PR to the `master` branch of this repository.
   - Use a PR title that matches [Conventional Commits](#commit-guidelines).
   - Ensure your PR passes all GitHub Actions checks and is approved by the repository owner.

---

## Commit Guidelines

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): imperative summary

Optional body explaining why.
```

### Types

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Behavior-preserving restructure |
| `chore` | Tooling, deps, config |
| `test` | Tests only |
| `docs` | Documentation only |
| `ci` | CI/CD only |

### Examples

- `feat(commands): add moderation kick command`
- `fix(events): correct guild member remove log message`
- `chore(deps): upgrade discord.js`
- `docs: clarify deploy commands workflow`

---

## Pull Request Guidelines

- PR titles should follow the same `type(scope): summary` format as commits.
- The PR must pass all GitHub Actions checks (lint, typecheck, tests, build).
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
