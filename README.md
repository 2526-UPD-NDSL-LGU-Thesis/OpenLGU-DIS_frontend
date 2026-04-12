# OpenLGU-DIS_frontend
Frontend for the OpenLGU-DIS, an open customizable LGU ID system that leverages the Philippine National ID, PhilSys



## Development / Forking

To develop on the project, the supported way is to use the provided dev container.

1. Clone / Fork the repository
2. Open the repository within a dev container using any supported method (Recommended way: In VS Code using [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)).
  - See docs on [developing with dev containers]() // TODO
3. Run `pnpm install` in the root directory to download all the dependencies the entire project needs.
  - Notice that we use `pnpm` as the package manager. Not `npm`, `yarn`, `deno`, or `bun`
4. This is a [monorepo](https://en.wikipedia.org/wiki/Monorepo) with each application and library (both called packages) defined in `pnpm-workspace.yaml`. To start the dev server of one application, `cd` into the associated directory and run `turbo dev`. E.g.:
  - `cd apps/public-portal`
  - `turbo dev`
  - See docs on [anatomy of the repository]() // TODO
5. Run `turbo build` to make the production builds in each application's `/dist` directory
  - `cd` into only one application if you need to only build that
6. To create a new application, simply create a new **direct** subfolder in `/apps` and treat that as the root when following the documentation.  E.g.:
  - `mkdir apps/<app-name>`
  - `cd apps/<app-name>`
  - `pnpm create vite`
  - See [creating new project packages]() // TODO
7. Make sure to follow `@openlguid/<name>` as naming convention of packages in `package.json` and to `pnpm install @openlguid/<library-name>` any shared libraries you need to use in your package.

To learn more about the project's tooling, read more in the [contribution documentation]() // TODO

