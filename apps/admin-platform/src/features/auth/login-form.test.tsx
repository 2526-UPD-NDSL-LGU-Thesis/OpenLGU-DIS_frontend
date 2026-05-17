import { QueryClient } from "@tanstack/react-query"
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"

import { server } from "#/tests/node"

import useAuthStore, { createAuthRuntime } from "./auth"
import { authApiBaseUrl } from "./api/authAPI"
import { LoginForm } from "./login-form"

interface TestRouterContext {
  auth: ReturnType<typeof createAuthRuntime>
}

function AuthenticatedArea() {
  const { session } = useAuthStore()
  return <p>Authenticated as {session.userProfile?.username ?? "none"}</p>
}

async function renderLoginFlow(redirectTo = "/protected") {
  const queryClient = new QueryClient()
  const auth = createAuthRuntime({ queryClient })

  const rootRoute = createRootRouteWithContext<TestRouterContext>()({
    component: () => <Outlet />,
  })
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: () => <LoginForm redirectTo={redirectTo} />,
  })
  const protectedRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/protected",
    component: AuthenticatedArea,
  })
  const routeTree = rootRoute.addChildren([loginRoute, protectedRoute])

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: ["/login"],
    }),
    context: { auth },
  })

  render(<RouterProvider router={router} />)
  await waitFor(() => {
    expect(router.state.location.pathname).toBe("/login")
  })

  return { router }
}

describe("LoginForm", () => {
  afterEach(() => {
    cleanup()
  })

  it("logs in successfully, redirects, and shows hydrated identity profile", async () => {
    const user = userEvent.setup()
    const { router } = await renderLoginFlow()

    await user.type(screen.getByLabelText("Username"), "employee-1")
    await user.type(screen.getByLabelText("Password"), "password")
    await user.click(screen.getByRole("button", { name: "Login" }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/protected")
    })
    expect(await screen.findByText("Authenticated as employee-1")).toBeInTheDocument()
  })

  it("keeps form visible and shows auth error when login fails", async () => {
    server.use(
      http.post(`${authApiBaseUrl}/token/`, () => {
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
      })
    )

    const user = userEvent.setup()
    const { router } = await renderLoginFlow()

    await user.type(screen.getByLabelText("Username"), "employee-1")
    await user.type(screen.getByLabelText("Password"), "bad-password")
    await user.click(screen.getByRole("button", { name: "Login" }))

    expect(await screen.findByText("Invalid username or password.")).toBeInTheDocument()
    expect(router.state.location.pathname).toBe("/login")
    expect(screen.getByRole("button", { name: "Login" })).toBeEnabled()
  })

  it("shows loading state and prevents duplicate login submissions", async () => {
    let tokenCalls = 0
    server.use(
      http.post(`${authApiBaseUrl}/token/`, async () => {
        tokenCalls += 1
        await new Promise((resolve) => {
          setTimeout(resolve, 250)
        })
        return HttpResponse.json({ access: "token" }, { status: 200 })
      }),
      http.get(`${authApiBaseUrl}/users/me/`, () => {
        return HttpResponse.json(
          { username: "employee-1", roles: ["SERVICE_CLAIM_ADMIN"] },
          { status: 200 }
        )
      })
    )

    const user = userEvent.setup()
    await renderLoginFlow()

    await user.type(screen.getByLabelText("Username"), "employee-1")
    await user.type(screen.getByLabelText("Password"), "password")
    const submitButton = screen.getByRole("button", { name: "Login" })

    await user.click(submitButton)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled()
    })

    await waitFor(() => {
      expect(tokenCalls).toBe(1)
    })
  })
})
