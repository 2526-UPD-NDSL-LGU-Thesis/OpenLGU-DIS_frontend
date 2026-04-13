
> [!nav] | [[Set-up new project packages]] | [[Shadcn Configuration]]

> [!bibliography]
> - https://ui.shadcn.com/docs/components-json

### Steps

1. Copy the `app's components.json` in ui/config-templates into the root of the new app

2. Install the shared package via `pnpm add @openlguid/ui --workspace`

3. Write `import "@openlguid/ui/globals.css";` into whichever root file injects the styles into index.html

E.g.,

- In TanStack Start template, it's in `__root.tsx`
- In Vite template, it's in `main.tsx`

4. And also import the locals.css

5. Delete the local `lib/utils.ts` which shad/cn generated. If you need to use the `cn` utility, `import { cn } @openlguid/lib/utils`

6. Delete existing shadcn components and import them from shared library instead

6. Do note this will likely break the css of the existing template app. You'll need to finangle and fix it up.


### Some sample fixes