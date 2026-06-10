
> [!nav] | [[Project Tooling Configurations]] | // TODO

> [!bibliography]
> - https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode

> [!sum]
> Outlined here are noteworthy custom configurations for the project


> Configure SPA mode for projects that don't really need SSR

```tsx
// vite.config.ts
export default defineConfig({
  plugins: [
    tanstackStart({
      spa: {
        enabled: true,
      },
    }),
  ],
})
```

Read more about it [here](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode#configuring-spa-mode)



