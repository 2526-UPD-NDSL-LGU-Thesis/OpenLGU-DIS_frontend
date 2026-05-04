import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { SidebarProvider } from "@openlguid/ui/components/sidebar"
import { NavUser } from "./nav-user"

const mockUser = {
  name: "Test User",
  email: "test@example.com",
  avatar: "/avatars/test.jpg",
}

describe("NavUser", () => {
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
})
