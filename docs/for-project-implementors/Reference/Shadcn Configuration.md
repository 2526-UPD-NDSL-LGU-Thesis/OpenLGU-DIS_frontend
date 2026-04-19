
> [!nav] | [[Project Tooling Configurations]] | // TODO

> [!bibliography]
> - https://ui.shadcn.com/docs/components-json
> - https://ui.shadcn.com/docs/monorepo

> [!sum]
> Outlined here are noteworthy custom configurations for the project





### Misc

- Used `#` and `@` pre-pended to some imports for simplificaiton
- In VSCode, if you have an issue with shadcn JSON schema not being loaded, the dev container may not be allowing the uri.
  - Look for json.schemaDownload.trustedDomains setting
  - Add `https://ui.shadcn.com/schema.json`
  - Reference: https://github.com/microsoft/vscode/issues/265177
- tsconfigs for new apps must be set-up right. Specifically for pathing. I cried a lot with this problem
  - https://github.com/shadcn-ui/ui/issues/7750
  - https://ui.shadcn.com/docs/components-json#aliases