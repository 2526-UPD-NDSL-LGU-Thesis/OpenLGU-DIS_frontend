import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"

import { IdManagementDashboard } from "./index"

describe("IdManagementDashboard", () => {
  afterEach(() => cleanup())

  it("renders metrics and a Start Issuance CTA with correct href", async () => {
    render(<IdManagementDashboard />)

    expect(await screen.findByText(/ID Management/i)).toBeInTheDocument()
    expect(await screen.findByText(/Total issued/i)).toBeInTheDocument()

    // There is a visible button; also ensure the hidden anchor points to issuance route
    const anchor = document.querySelector('a[href="/id-management/issuance"]')
    expect(anchor).not.toBeNull()
  })
})
