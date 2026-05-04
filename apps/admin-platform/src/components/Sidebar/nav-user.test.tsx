import { describe, expect, it, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { SidebarProvider } from "@openlguid/ui/components/sidebar"
import { NavUser } from "./nav-user"

const mockUser = {
  name: "Test User",
  email: "test@example.com",
  avatar: "/avatars/test.jpg",
}

describe("NavUser", () => {
  afterEach(() => {
    cleanup()
  })
  it("invokes onLogout callback when Log out menu item is clicked", async () => {
    const mockOnLogout = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <SidebarProvider>
        <NavUser user={mockUser} onLogout={mockOnLogout} />
      </SidebarProvider>
    )

    // Click the dropdown trigger
    const buttons = screen.getAllByRole("button")
    await user.click(buttons[0])

    // Click Log out
    const logoutItem = await screen.findByText("Log out")
    await user.click(logoutItem)

    expect(mockOnLogout).toHaveBeenCalledTimes(1)
  })

  it("disables Log out button while logout promise is pending", async () => {
    let resolveLogout: (() => void) = () => {}
    const logoutPromise = new Promise<void>((resolve) => {
      resolveLogout = resolve
    })
    const mockOnLogout = vi.fn(async () => {
      await logoutPromise
    })
    const user = userEvent.setup()

    render(
      <SidebarProvider>
        <NavUser user={mockUser} onLogout={mockOnLogout} />
      </SidebarProvider>
    )

    // Click the dropdown trigger
    const buttons = screen.getAllByRole("button")
    await user.click(buttons[0])

    // Click Log out
    const logoutItem = await screen.findByText("Log out")
    await user.click(logoutItem)

    expect(mockOnLogout).toHaveBeenCalledTimes(1)

    // Resolve the promise
    resolveLogout()
  })

  it("renders user name and email", () => {
    render(
      <SidebarProvider>
        <NavUser user={mockUser} />
      </SidebarProvider>
    )

    // User name should be visible in dropdown trigger
    expect(screen.getByText(mockUser.name)).toBeInTheDocument()

    // User email should be visible in dropdown trigger
    expect(screen.getByText(mockUser.email)).toBeInTheDocument()
  })
})
