// Dictates the behavior of TanStack Router used within Start

import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { getContext } from './integrations/tanstack-query/root-provider'
import { createAuthRuntime } from './features/auth/auth'

let mockWorkerStarted = false

async function ensureMockWorkerStarted() { // TODO ASK is this really necessary?
  if (!import.meta.env.DEV || typeof window === 'undefined' || mockWorkerStarted) {
    return
  }

  const { worker } = await import('./tests/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
  mockWorkerStarted = true
}

export async function getRouter() {
  await ensureMockWorkerStarted()
  const context = getContext()
  const auth = createAuthRuntime({ queryClient: context.queryClient })

  const router = createTanStackRouter({
    routeTree,
    context: { ...context, auth },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient }) // TODO do I need this? We're not making an SSR. More like an SPA.

  return router
}

// https://tanstack.com/router/latest/docs/decisions-on-dx#declaring-the-router-instance-for-type-inference
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
