> [!Note] Project Status
> Active Development

# OpenLGU ID

OpenLGU ID, an open customizable LGU ID system that leverages the Philippine National ID, PhilSys.

## Background

Metro Manila LGUs have taken to creating their own Digital Identity Systems (DIS) to act as key components in their digital public infrastructures because they give each resident a digital identity that allow verifiable access to government services.

Given similarities in LGUs' function and responsibilities and the existing mature data and infrastructure of PhilSys, we created a framework for an LGU DIS that serves as a jumping off point for LGUs to develop their own DIS. This repository contains an implementation of this framework to further serve as an example for a DIS and to allow direct forking for project implementors.

<!-- For elaboration on motivation, significance, design influences, and architecture, see our undergraduate [thesis paper]() about this framework. -->

<!-- TODO add references -->

## Features

- ID Issuance
     - Straightforward ID issuance with PhilSys Autofill for ease of input.
- Sector Group Management
     - Abstraction of various resident groups in an LGU. It serves to help LGUs to create and identify the relevant sectors they need (e.g., seniors, PUV drivers, students, etc.) while keeping personal information private.
- Service Claiming
     - Abstraction of various service transactions in an LGU. It can represent anything where one needs to track availing and number of "stocks" for a service such as Ayuda distribution, discount claiming, etc.
- Use of PhilSys ID over LGU ID
     - This reduces LGUs cost burdern in printing Physical IDs by allowing the use of PhilSys ID to access digital services instead of an LGU ID.


## Contributing / Forking

To develop on the project, the supported way is to use the provided dev container.

1. Clone / Fork the repository
2. Open the repository within a dev container using any supported method (Recommended way: In VS Code using [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)).
     <!-- - See docs on [developing with dev containers]() // TODO -->
3. Run `pnpm install` in the root directory to download all the dependencies the entire project needs.
     - Notice that we use `pnpm` as the package manager. Not `npm`, `yarn`, `deno`, or `bun`
4. This is a [monorepo](https://en.wikipedia.org/wiki/Monorepo) with each application and library (both called packages) defined in `pnpm-workspace.yaml`. To start the dev server of one application, `cd` into the associated directory and run `turbo dev`. E.g.:
     - `cd apps/public-portal`
     - `turbo dev`
     <!-- - See docs on [anatomy of the repository]() // TODO -->
5. Run `turbo build` to make the production builds in each application's `/dist` directory
     - `cd` into only one application if you need to only build that
6. To create a new application, simply create a new **direct** subfolder in `/apps` and treat that as the root when following the documentation.  E.g.:
     - `mkdir apps/<app-name>`
     - `cd apps/<app-name>`
     - `pnpm create vite`
     <!-- - See [creating new project packages]() // TODO -->
7. Make sure to follow `@openlguid/<name>` as naming convention of packages in `package.json` and to `pnpm install @openlguid/<library-name>` any shared libraries you need to use in your package.

<!-- To learn more about the project's tooling, read more in the [contribution documentation]() // TODO -->
<!-- 
## Deployment

// TODO -->

## Authors and Acknowlegements

This project was written and developed in fulfillment of the requirements for the CS 198--199 courses of UP Diliman's Department of Computer Science degree program.

Developed by:

- Lanz Conanan
- James Geraldo

We thank [Sir Wilson Tan](https://dcs.upd.edu.ph/people/wmtan) of the Networks and Distributed Systems Lab for being our thesis adviser on this project.

## License

See [LICENSE](LICENSE)

<!-- ## Bibliography -->


