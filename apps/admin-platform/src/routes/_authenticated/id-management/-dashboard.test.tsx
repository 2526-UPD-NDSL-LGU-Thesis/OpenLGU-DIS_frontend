import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { IdManagementDashboard } from "./index"
import "#/features/id-management/issuance/issuance-test-mocks"
import IssuanceWizard from "#/features/id-management/issuance/IssuanceWizard"

async function renderIdManagementFlow() {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  })
  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/id-management",
    component: IdManagementDashboard,
  })
  const issuanceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/id-management/issuance",
    component: IssuanceWizard,
  })
  const routeTree = rootRoute.addChildren([dashboardRoute, issuanceRoute])

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: ["/id-management"],
    }),
  })

  render(<RouterProvider router={router} />)

  await waitFor(() => {
    expect(router.state.location.pathname).toBe("/id-management")
  })

  return { router }
}

describe("IdManagementDashboard", () => {
  afterEach(() => cleanup())

  it("renders metrics and a Start Issuance CTA with correct href", async () => {
    await renderIdManagementFlow()

    expect(await screen.findByText(/ID Management/i)).toBeInTheDocument()
    expect(await screen.findByText(/Total issued/i)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Start Issuance" })).toHaveAttribute(
      "href",
      "/id-management/issuance"
    )
  })

  it("navigates to issuance and shows the wizard's primary applicant fields", async () => {
    const user = userEvent.setup()
    await renderIdManagementFlow()

    await user.click(screen.getByRole("link", { name: "Start Issuance" }))

    expect(await screen.findByLabelText(/First name/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/Last name/i)).toBeInTheDocument()
    expect(await screen.findByLabelText(/Proof of residence/i)).toBeInTheDocument()
  })
})
