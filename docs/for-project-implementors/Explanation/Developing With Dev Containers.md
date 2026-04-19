# Developing With Dev Containers 

> | [Index](<../$ Navigation/Index.md>) |

We advise to use Dev Containers for development in order to simplify onboarding. The container will ensure we have the same development environment so you won't have the hassle of just trying to the software running on your machine. We don't provide explicit instructions for getting started without it.

However, some developers may prefer not to use dev containers (we hear that container performance on MacOS can be poor). In such a case, the most assistance we provide is additional information on the dev container we use (aside from the devcontainer.json itself) in hopes that it'll help you in replicating the development environment.

## Developing Without It

Here's the development tooling you'll need:

- We use `pnpm` to manage external packages in applications written in Web Technologies.
  - See https://pnpm.io/installation for instructions
  - We use pnpm version <insert version> // TODO it would be nice if there were variables in documentation framework we choose