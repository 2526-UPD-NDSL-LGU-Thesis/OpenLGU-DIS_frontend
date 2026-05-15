// @vitest-environment jsdom

import React from "react"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  verifyQR: vi.fn(async () => ({
    result: "success" as const,
    idDetails: {
      local_id: "1000",
      full_name: "Juan Dela Cruz",
      dob: "2000-01-01",
      gender: "Male",
      email: "juan@example.com",
      phone: "09221 924 7284",
      face: ";-;",
      issuerType: "LGU" as const,
    },
    message: "Loaded from local mock data utility.",
  })),
}))

let capturedOnSubmit: ((request: { kind: "qr" | "manual"; rawQRValue?: string; identifier?: string; identifierType?: "UIN" | "PCN" }) => Promise<void>) | null = null

vi.mock("@openlguid/ui/features/verification/api/verificationService", () => ({
  verifyQR: mocks.verifyQR,
}))

vi.mock("@openlguid/ui/features/verification/components/IdentifierCaptureDialog", () => ({
  IdentifierCaptureDialog: (props: {
    onSubmit: (request: { kind: "qr" | "manual"; rawQRValue?: string; identifier?: string; identifierType?: "UIN" | "PCN" }) => Promise<void>
  }) => {
    capturedOnSubmit = props.onSubmit
    return null
  },
}))

import { VerificationPage } from "./VerificationPage"

afterEach(() => {
  capturedOnSubmit = null
  mocks.verifyQR.mockClear()
  document.body.innerHTML = ""
})

function renderPage() {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root: Root = createRoot(container)

  act(() => {
    root.render(<VerificationPage />)
  })

  return {
    container,
    root,
  }
}

describe("VerificationPage", () => {
  it("uses the captured QR payload to drive verification UI", async () => {
    const { container, root } = renderPage()

    await act(async () => {
      if (!capturedOnSubmit) {
        throw new Error("Identifier dialog submit handler was not captured.")
      }

      await capturedOnSubmit({
        kind: "qr",
        rawQRValue: "mockedAPISuccess",
      })
    })

    expect(mocks.verifyQR).toHaveBeenCalledWith("mockedAPISuccess")
    expect(container.textContent).toContain("Verified")
    expect(container.textContent).toContain("Identity confirmed")
    expect(container.textContent).toContain("Juan Dela Cruz")

    act(() => {
      root.unmount()
    })
  })
})
