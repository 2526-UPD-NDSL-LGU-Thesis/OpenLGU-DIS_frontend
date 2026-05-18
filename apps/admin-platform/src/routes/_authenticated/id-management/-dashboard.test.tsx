import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { IdManagementDashboard } from "./index"
import "#/features/id-management/issuance/issuance-test-mocks"
import IssuanceWizard from "#/features/id-management/issuance/IssuanceWizard"
import { IdPreviewRouteComponent } from "./id-preview"

const mocks = vi.hoisted(() => ({
  verifyQR: vi.fn(async () => ({
    result: "success" as const,
    qr_type: "OpenLGUQR",
    idDetails: {
      uin: "1000",
      pcn: "2000",
      full_name: "Juan Dela Cruz",
      dob: "2000-01-01",
      gender: "Male",
      location: "Gubat, Diyan",
      email: "juan@example.com",
      phone: "09221 924 7284",
      face: ";-;",
    },
  })),
}))

vi.mock("@openlguid/ui/features/verification/api/verificationService", () => ({
  verifyQR: mocks.verifyQR,
}))

vi.mock("@openlguid/ui/features/verification/components/IdentifierCaptureDialog", () => ({
  IdentifierCaptureDialog: (props: {
    open: boolean
    onSubmit: (request: { kind: "qr"; rawQRValue: string }) => Promise<void>
  }) => {
    if (!props.open) {
      return null
    }

    return (
      <button
        type="button"
        onClick={() =>
          props.onSubmit({
            kind: "qr",
            rawQRValue: "mockedAPISuccess",
          })
        }
      >
        Submit capture
      </button>
    )
  },
}))

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
  const previewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/id-management/id-preview",
    component: IdPreviewRouteComponent,
  })
  const routeTree = rootRoute.addChildren([
    dashboardRoute,
    issuanceRoute,
    previewRoute,
  ])

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
  afterEach(() => {
    cleanup()
    mocks.verifyQR.mockClear()
  })

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

  it("verifies a capture and routes to the ID preview success page", async () => {
    const user = userEvent.setup()
    const { router } = await renderIdManagementFlow()

    await user.click(screen.getByRole("button", { name: "Verify/View/Print ID" }))

    expect(await screen.findByRole("button", { name: "Submit capture" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Submit capture" }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/id-management/id-preview")
    })
    expect(mocks.verifyQR).toHaveBeenCalledWith("mockedAPISuccess")
    expect(await screen.findByTitle("Physical LGU ID preview")).toBeInTheDocument()
  })
})
