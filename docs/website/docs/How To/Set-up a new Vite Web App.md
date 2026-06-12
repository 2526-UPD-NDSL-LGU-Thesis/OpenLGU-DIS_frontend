
> [!nav] | [[Set-up new project packages]] |

> [!bibliography]
> - https://vite.dev/guide/#scaffolding-your-first-vite-project

### Steps

1. Run `pnpm create vite`

### Tooling that needs additional set-up

- If developing inside container, configure Vite to listen(?) on host
    - https://stackoverflow.com/questions/70012970/running-a-vite-dev-server-inside-a-docker-container
    - https://vite.dev/config/server-options#server-host
    - // TODO this is a possible vulnerability in development as it may expose to LAN, especially if not deving inside container
- Tanstack Router says [here](https://tanstack.com/router/latest/docs/installation/with-vite)
- Vitest and MSW
    - Especially vitest setup files.
    - https://vitest.dev/guide/mocking/requests.html, https://mswjs.io/docs/quick-start, https://vitest.dev/guide/learn/setup-teardown.html#setup-files

### Weirdness

- Why two different tsconfigs?
    - https://github.com/vitejs/vite/discussions/20149
