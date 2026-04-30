# Agentic A.I. Guide for OpenLGU-DIS Frontend MonoRepo

This monorepo contains multiple applications and shared libraries for the OpenLGUID system, a templateable and customizable Philippine LGU ID system intended to be integrated with the country's national ID, PhilSys.

It is templateable meaning it is intended to be forked for LGUs to use on their own.

## Quick Start

**Tech Stack**: See individual packages's `package.json`

**Setup**: Use the provided dev container.

**Begin Dev**
```bash
pnpm install
cd apps/<name>
turbo dev
```

**Core Commands**:
```bash
turbo dev       # Start all dev servers (persistent, concurrent)
turbo build     # Build all packages (outputs to /dist)
turbo test      # Run tests across workspace (persistent)
turbo lint      # Lint all packages (ESLint + TypeScript strict mode)
turbo <script command> --filter=<name> # to target the specific application
```

## Code Style


### Import Paths

- **App-local code**: `#/*` alias resolves to `src/*` (e.g., `#/components`, `#/hooks`)
- **Shared libraries**: `@openlguid/ui/*`, `@openlguid/api/*`


## Software Engineering Patterns

- **Frontend Development Flow**: Type definitions → API Calls → Custom hooks → Components

### Monorepo Structure

- **Respect workspace boundaries**: Libraries export via `@openlguid/` namespace; apps are independent

| Path | Purpose |
|------|---------|
| `apps/admin-platform/` | LGU employees webapp to deliver LGU services |
| `apps/public-portal/` | Website for the public to access some LGU services|
| `libraries/ui/` | Shared shadcn/ui component library |
| `libraries/api/` | API integration layer (WIP) |
| `libraries/typescript-config/` | Shared TypeScript configuration (strict defaults) |
| `libraries/eslint-config/` | Shared ESLint rules |
| `docs/` | [Developer documentation](./docs/for-project-implementors/) - reference for architecture, setup guides, conventions |

All packages use `@openlguid/<name>` namespace (e.g., `@openlguid/ui`, `@openlguid/api`).


### Directory structure

- Use "vertical architecture" (i.e., slicing and working based on feature modules) within a package
  - Concretely, files related to a feature stay together within `features/`
  - Global/shared files stay in top folders of the package


### State Management

- **Server State**: TanStack Query for API data
- **Client State**: Zustand for stores + Router's URLParams; Router context for typed routes


### UI/UX

**Add a new UI component to shared library**:

```bash
cd apps/<name>
pnpm dlx shadcn-ui@latest add <component-name>
# Component auto-installed to libraries/ui/ via components.json alias
```

**Use function components with proper TypeScript interfaces:**

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={cn(buttonVariants({ variant }))}>
      {children}
    </button>
  );
}
```


## Testing

- Tests colocated with source
- Ensure tests cover edge cases and error handling
- Don't cheat in making tests by making them easier to pass.
  - If tests fail, focus on improving the code.
- Don't cheat in writing code by making them easier to test.
  - Focus on functionality, readability, and good software engineering patterns first
- Tooling
  - Vitest + Mock Service Worker (MSW) for API mocking;

**Common commands**

```bash
turbo test # for full test suites
vitest run -t <test name> # to target specific tests

```

## DevOps

- Use `turbo` for running scripts
- Use `pnpm` for package management. Not `npm`. Not `bun`. Not `deno`.
- 

### Before Committing

```bash
turbo lint    # Check ESLint violations across all packages
turbo build   # Verify all packages build successfully
turbo test    # Run full test suite (if tests exist)
```


### Git Conventions

Use the Conventional Commits Standard combined with gitmojis. Format:

```bash
<type>(<optional scope>): <description>

<optional body>

<optional key-value footer(s)>
```

- View commit history for samples.
- IF you need more concrete references for messages see [git commit conventions]() // TODO NOT DONE YET



## Further Research

> Check these out IF you need them for your task

- IF you don't have any good references for implementing features, **Check these Golden examples**:
  - // TODO Don't have any yet
- 

