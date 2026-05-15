// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { IdentifierCaptureDialog } from "@openlguid/ui/features/verification/components/IdentifierCaptureDialog"

const startWebcamScan = vi.fn()
const stopWebcamScan = vi.fn()
const handleFileUpload = vi.fn()
const reset = vi.fn()
let mockScanResult:
  | {
      kind: "qr"
      rawQRValue: string
    }
  | {
      kind: "error"
      message: string
    }
  | null = null

vi.mock("#features/verification/hooks/use-qr-scanner.js", () => ({
  useQRScanner: () => ({
    videoRef: { current: null },
    startWebcamScan,
    stopWebcamScan,
    isScanning: false,
    handleFileUpload,
    scanResult: mockScanResult,
    isLoading: false,
    reset,
  }),
}))

beforeEach(() => {
  mockScanResult = null
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("IdentifierCaptureDialog", () => {
  it("submits manual capture through the injected submitter and closes on success", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onSubmit: (request: {
      kind: "qr" | "manual"
      rawQRValue?: string
      identifier?: string
      identifierType?: "UIN" | "PCN"
    }) => Promise<void> = vi.fn(async () => undefined)

    render(
      <IdentifierCaptureDialog
        open
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />
    )

    await user.click(screen.getByRole("tab", { name: /manual entry/i }))
    await user.click(screen.getByRole("radio", { name: /uin/i }))
    await user.type(screen.getByLabelText(/uin or pcn/i), "uin-123")
    await user.click(screen.getByRole("button", { name: /capture/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        kind: "manual",
        identifierType: "UIN",
        identifier: "uin-123",
      })
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("submits captured QR payload through the injected submitter and closes on success", async () => {
    mockScanResult = { kind: "qr", rawQRValue: "mocked-qr" }

    const onOpenChange = vi.fn()
    const onSubmit = vi.fn(async () => undefined)

    render(
      <IdentifierCaptureDialog
        open
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />
    )

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        kind: "qr",
        rawQRValue: "mocked-qr",
      })
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
