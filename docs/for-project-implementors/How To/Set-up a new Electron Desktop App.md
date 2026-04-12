
> [!nav] | [[Set-up new project packages]] |

> [!bibliography]
> - https://www.electronforge.io/
> - https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app 
> - https://pnpm.io/settings#nodelinker

// TODO Or run a script that automatically sets this up

### Addressing the peculiarities

- The primary problem electron does not provide a nice simple solution for setting up on a monorepo. 
- In using the recommended create electron-app template from Electron Forge, I ran into dependency issues:
  - Wherever Electron needed the dependency, it conflicted with the existing monorepo structure so installation would fail.
  - There were issues with varying dependency versions (between monorepo and template app) which made installation also fail.
- I basically just stumbled upon a working solution. Set-up an existing `pnpm-workspace.yaml` that configures pnpm to hoist it's packages like npm (which is what Electron Forge likes).


### Steps

1. Make a new directory for the app and change directory into it

```bash
mkdir apps/<app-name>
cd apps
```  

2. Create and edit a local `pnpm-workspace.yaml` to set `nodeLinker: hoisted` as required by Electron

```bash
touch <app-name>/pnpm-workspace.yaml
echo "nodeLinker: hoisted" >> <app-name>/pnpm-workspace.yaml
```

3. Initialize a new electron app inside it with Electron Forge. Recommend you use Vite with Typescript template for parity with other tooling in this monorepo. (See [Project tooling](// TODO) for more info)

```bash
pnpm create electron-app@latest <app-name> --template=vite-typescript
cd <app-name>
```

4. Make sure to edit the name in the local `package.json` to include @openlguid/<app-name> plus change the description!


5. Append `-- --no-sandbox` to the the start script in the local `package.json`