import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"

import "./issuance-test-mocks"

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
    "@tanstack/react-router"
  )

  return {
    ...actual,
    Link: ({
      children,
      to,
      ...props
    }: {
      children: React.ReactNode
      to: string
      [key: string]: unknown
    }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  }
})

import { IssuanceSuccessPage } from "./issuance-success-page"

describe("IssuanceSuccessPage", () => {
  beforeEach(() => {
    vi.spyOn(window, "open").mockImplementation(() => null)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("renders issuance details and shared success actions", () => {
    render(
      <IssuanceSuccessPage
        data={{
          preview: {
            full_name: "Juan Dela Cruz",
            uin: "UIN-2026-0001",
            dob: "2000-01-01",
            gender: "Male",
            address: "Sample Address",
            phone: "09170000000",
            qrValue: "QR-2026-0001",
            pcn: "PCN-2026-0001",
          },
        }}
      />
    )

    expect(screen.getByText(/Assigned UIN:/i)).toBeInTheDocument()
    expect(screen.getByText(/PCN:/i)).toBeInTheDocument()
    expect(screen.getByText(/QR:/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Print ID/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Download PDF/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Back to dashboard/i })).toBeInTheDocument()
  })

  it("auto-opens the printable preview in a background tab on mount", () => {
    const openSpy = vi.spyOn(window, "open")

    render(
      <IssuanceSuccessPage
        data={{
          preview: {
            full_name: "Juan Dela Cruz",
            uin: "UIN-2026-0001",
            dob: "2000-01-01",
            gender: "Male",
            address: "Sample Address",
            phone: "09170000000",
            qrValue: "QR-2026-0001",
          },
        }}
      />
    )

    expect(openSpy).toHaveBeenCalledWith("blob:mock-physical-id-preview", "_blank", "noopener,noreferrer")
    expect(openSpy).toHaveBeenCalledTimes(1)
  })

  it("warns before leaving and blocks dashboard navigation when not confirmed", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false)

    render(
      <IssuanceSuccessPage
        data={{
          preview: {
            full_name: "Juan Dela Cruz",
            uin: "UIN-2026-0001",
            dob: "2000-01-01",
            gender: "Male",
            address: "Sample Address",
            phone: "09170000000",
            qrValue: "QR-2026-0001",
          },
        }}
      />
    )

    const clickAllowed = fireEvent.click(screen.getByRole("link", { name: /Back to dashboard/i }))
    expect(clickAllowed).toBe(false)
    expect(confirmSpy).toHaveBeenCalled()

    const beforeUnload = new Event("beforeunload", { cancelable: true }) as BeforeUnloadEvent
    ;(beforeUnload as unknown as { returnValue?: string }).returnValue = ""
    window.dispatchEvent(beforeUnload)
    expect(beforeUnload.defaultPrevented).toBe(true)
  })

  it("allows dashboard navigation after confirmation", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

    render(
      <IssuanceSuccessPage
        data={{
          preview: {
            full_name: "Juan Dela Cruz",
            uin: "UIN-2026-0001",
            dob: "2000-01-01",
            gender: "Male",
            address: "Sample Address",
            phone: "09170000000",
            qrValue: "QR-2026-0001",
          },
        }}
      />
    )

    const clickAllowed = fireEvent.click(screen.getByRole("link", { name: /Back to dashboard/i }))
    expect(clickAllowed).toBe(true)
    expect(confirmSpy).toHaveBeenCalled()
  })
})
