
> This is a Monorepo of all the frontend (See [turbo's docs](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository#specifying-packages-in-a-monorepo) to understand the structure)

- /.devcontainer - contains dev containers
- /.github - 
- /apps/* - contains each frontend webapp
  - /src - the source directory contains the source code of the rpoject
  - /src/assets - contains static assets that should be optimized
  - /public - contains statis assets that should not be optimized
  - index.html - the entry point of the project
    - See [Vite Documentation](https://vite.dev/guide/#index-html-and-project-root) on this
    - package.json - contains dependencies and npm run scripts
    - tsconfig.json - 
    - vite.config.ts - the Vite configuration. See [Vite Config Docs](https://vite.dev/config/)
- components.json - from shadcn which tells the CLI how and where to install components