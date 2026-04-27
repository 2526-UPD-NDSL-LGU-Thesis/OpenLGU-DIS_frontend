# Note on Development Tooling and Preferences

> | [Index](<../$ Navigation/Index.md>) |


- Uses pnpm (for monorepo) ESLint, Tailwind, 
- ESLint configuration as defined in `eslint.config.js`
  - We use strict typescript linting as recommended. Bear this in mind
  - We also use React linting via [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom)

- [Testing](Testing.md)
  - [Vitest](https://vitest.dev/) for unit tests
  - [Mock Service Worker](https://mswjs.io/) for mocking APIs