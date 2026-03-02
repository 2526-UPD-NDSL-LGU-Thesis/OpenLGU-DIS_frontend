# OpenLGU-DIS_frontend
Frontend for the OpenLGU-DIS, an open customizable LGU ID system that leverages the Philippine National ID, PhilSys



## Development / Forking

To develop on the project, the supported way is to use the provided dev container.

1. Clone / Fork the repository
2. Open the repository within a dev container using any supported method (Recommended way: In VS Code using [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)).
3. Run `npm install` to download all the dependencies the project needs. You may now start hacking at the code if you wish.
4. Run `npm run dev` to start the development server and see the application.
5. Run `npm run build` to make the production build



### Dev Container Details / Developing Without It


We advise to use Dev Containers for development in order to simplify onboarding. The container will ensure we have the same development environment so you won't have the hassle of just trying to the software running on your machine. We don't provide explicit instructions for getting started without it.

However, some developers may prefer not to use dev containers (we hear that container performance on MacOS can be poor). In such a case, the most assistance we provide is additional information on the dev container we use (aside from the devcontainer.json itself) in hopes that it'll help you in replicating the development environment.


## Anatomy of the repository


- /.devcontainer - contains dev containers
- /.github - 
- /src - the source directory contains the source code of the rpoject
- /src/assets - contains static assets that should be optimized
- /public - contains statis assets that should not be optimized
- index.html - the entry point of the project
  - See [Vite Documentation](https://vite.dev/guide/#index-html-and-project-root) on this
- package.json - contains dependencies and npm scripts
- vite.config.ts - the Vite configuration


# React + TypeScript + Vite Template

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
