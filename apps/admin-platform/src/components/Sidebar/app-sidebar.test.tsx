import { QueryClient } from "@tanstack/react-query"
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { SidebarProvider } from "@openlguid/ui/components/sidebar"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import { AppSidebar } from "#/components/Sidebar/app-sidebar"
import { createAuthRuntime } from "#/features/auth/auth"

interface TestRouterContext {
  auth: ReturnType<typeof createAuthRuntime>
}

function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div>Dashboard</div>
    </SidebarProvider>
  )
}

async function renderSidebarFlow() {
  const queryClient = new QueryClient()
  const auth = createAuthRuntime({ queryClient })

  await auth.sessionService.login({
    username: "employee-1",
    password: "password",
  })

  const rootRoute = createRootRouteWithContext<TestRouterContext>()({
    component: () => <Outlet />,
  })
  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/dashboard",
    component: Dashboard,
  })
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: () => <p>Login Page</p>,
  })
  const routeTree = rootRoute.addChildren([dashboardRoute, loginRoute])

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: ["/dashboard"],
    }),
    context: { auth },
  })

  render(<RouterProvider router={router} />)

  await waitFor(() => {
    expect(router.state.location.pathname).toBe("/dashboard")
  })

  return { auth, router }
}

describe("AppSidebar", () => {
  afterEach(() => {
    cleanup()
  })

  it("runs full logout journey: sidebar click clears session and redirects to login", async () => {
    const { auth, router } = await renderSidebarFlow()
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: /employee-1/i }))
    await user.click(await screen.findByText("Log out"))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login")
    })
    expect(await screen.findByText("Login Page")).toBeInTheDocument()
    expect(auth.sessionService.getAuthState().phase).toBe("unauthenticated")
  })
})
