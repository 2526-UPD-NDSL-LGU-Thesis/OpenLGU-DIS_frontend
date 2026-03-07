# OpenLGU-DIS_frontend
Frontend for the OpenLGU-DIS, an open customizable LGU ID system that leverages the Philippine National ID, PhilSys



## Development / Forking

To develop on the project, the supported way is to use the provided dev container.

1. Clone / Fork the repository
2. Open the repository within a dev container using any supported method (Recommended way: In VS Code using [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)).
3. Run `npm install` to download all the dependencies the project needs. You may now start hacking at the code if you wish.
4. Run `npm run dev` to start the development server and see the application.
5. Run `npm run build` to make the production build and output it to `/dist` directory
  - Make sure to preview this build locally via `npm run preview` run the files in that directory



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
- package.json - contains dependencies and npm run scripts
- tsconfig.json - 
- vite.config.ts - the Vite configuration. See [Vite Config Docs](https://vite.dev/config/)

## Note on Development Preferences


- ESLint configuration as defined in `eslint.config.js`
  - We use strict typescript linting as recommended. Bear this in mind
  - We also use React linting via [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom)

