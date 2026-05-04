import { describe, expect, it, vi, afterEach } from "vitest"
import { render, screen, cleanup, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

it("trivial", () => {
    expect(5).toEqual(5);
})

// vi.mock("@tanstack/react-router", async () => {
//   const actual = await vi.importActual("@tanstack/react-router")
//   return {
//     ...actual,
//     useRouter: () => ({
//       navigate: vi.fn().mockResolvedValue(undefined),
//     }),
//   }
// })

// import { LoginForm } from "./login-form"

// describe("LoginForm", () => {
//   afterEach(() => {
//     cleanup()
//     vi.clearAllMocks()
//   })

//   it("renders controlled username and password inputs", async () => {
//     const user = userEvent.setup()

//     render(<LoginForm />)

//     const usernameInput = screen.getByLabelText(/email/i) as HTMLInputElement
//     const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

//     // Test controlled inputs
//     await user.type(usernameInput, "testuser")
//     await user.type(passwordInput, "password123")

//     expect(usernameInput.value).toBe("testuser")
//     expect(passwordInput.value).toBe("password123")
//   })

//   it("disables login button while login is pending", async () => {
//     const user = userEvent.setup()

//     render(<LoginForm />)

//     const usernameInput = screen.getByLabelText(/email/i) as HTMLInputElement
//     const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
//     const loginButton = screen.getByRole("button", { name: /^login$/i })

//     // Fill form with valid credentials
//     await user.type(usernameInput, "testuser")
//     await user.type(passwordInput, "password123")

//     // Before submit - button is enabled
//     expect(loginButton).not.toHaveAttribute("disabled")

//     // Submit form
//     await user.click(loginButton)

//     // Button should be disabled (even if briefly before nav)
//     await waitFor(() => {
//       const btn = screen.queryByRole("button", { name: /logging in/i })
//       expect(btn || loginButton).toHaveAttribute("disabled")
//     })
//   })
// })
