
> [!nav] | [[Set-up new project packages]] |

> [!bibliography]
> - https://www.electronforge.io/
> - https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app 
> - https://pnpm.io/settings#nodelinker

// TODO Or run a script that automatically sets this up

1. Change directory into /apps folder.

```bash
cd apps
```  

2. Initialize a new electron app inside it with Electron Forge. Recommend you use Vite with Typescript template for parity with other tooling in this monorepo. (See [Project tooling](// TODO) for more info)

```bash
pnpx create-electron-app@latest <app-name> --template=vite-typescript
cd <app-name>
```

You may encounter an errror that says "pnpm.onlyBuiltDependencies" was found in the local package.json. This is just a quirk because this template starter app does not expect we're in a monorepo. Simply remove the `pnpm` key in that package.json as we've hoisted the appropriate setings in the root `pnpm-workspace.yaml`.

You may also encounter an error that says "Failed to install modules: <an array of npm modules>". I don't have an easy solution here other than manually installing them later. Luckily, pnpm displays the command that failed so we can simply save it for later. Below is an EXAMPLE (which means don't copy what's listed here) of the command we used in setting up `@openlguid/admin-portal`. Beware the new lines your terminal may output. I removed them.

```bash
pnpm add @electron-forge/plugin-vite@^7.11.1 @types/electron-squirrel-startup@^1.0.2 @typescript-eslint/eslint-plugin@^5.0.0 @typescript-eslint/parser@^5.0.0 eslint@^8.0.1 eslint-plugin-import@^2.25.0 typescript@~4.5.4 vite@^5.0.12 --save-dev
```
```bash
pnpm add @electron/fuses@^1.0.0 @electron-forge/cli@^7.11.1 @electron-forge/maker-squirrel@^7.11.1 @electron-forge/maker-zip@^7.11.1 @electron-forge/maker-deb@^7.11.1 @electron-forge/maker-rpm@^7.11.1 @electron-forge/plugin-auto-unpack-natives@^7.11.1 @electron-forge/plugin-fuses@^7.11.1 --save-dev
```

The issue in this case was the pre-selected versions of eslint (8.0.1) is incompatible with the project's global version (9.39.1). You'll see an Invalid Version error if this is the case. We'll deal with it later.

3. Create and edit a local `pnpm-workspace.yaml` to set `nodeLinker: hoisted` as required by Electron

```bash
touch pnpm-workspace.yaml
echo "nodeLinker: hoisted" >> pnpm-workspace.yaml
```

4. Make sure to edit the name in the local `package.json` to include @openlguid/<app-name> plus change the description!

5. Let's deal with the issue of failed dependencies installation BECAUSE of version conflicts. Take the saved command earlier and remove the versions. Then `pnpm add`

```bash
pnpm add @electron-forge/plugin-vite@^7.11.1 @types/electron-squirrel-startup@^1.0.2 @typescript-eslint/eslint-plugin@^5.0.0 @typescript-eslint/parser@^5.0.0 eslint eslint-plugin-import@^2.25.0 typescript vite @electron/fuses @electron-forge/cli@^7.11.1 @electron-forge/maker-squirrel@^7.11.1 @electron-forge/maker-zip@^7.11.1 @electron-forge/maker-deb@^7.11.1 @electron-forge/maker-rpm@^7.11.1 @electron-forge/plugin-auto-unpack-natives@^7.11.1 @electron-forge/plugin-fuses@^7.11.1 --save-dev
```

5. Run `pnpm install` in the root project so the appropriate dependencies are installed (they're dependent on catalog versioning)