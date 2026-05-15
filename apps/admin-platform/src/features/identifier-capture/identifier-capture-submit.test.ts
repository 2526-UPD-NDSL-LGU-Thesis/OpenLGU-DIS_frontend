import { describe, expect, it, vi } from "vitest"

import { submitIdentifierCapture } from "./identifier-capture-submit"

describe("submitIdentifierCapture", () => {
  it("routes QR captures to the qr handler", async () => {
    const qr = vi.fn(async (rawQRValue: string) => rawQRValue)
    const manual = vi.fn(async () => "manual")

    await expect(
      submitIdentifierCapture(
        { kind: "qr", rawQRValue: "qr-payload" },
        { qr, manual }
      )
    ).resolves.toBe("qr-payload")

    expect(qr).toHaveBeenCalledWith("qr-payload")
    expect(manual).not.toHaveBeenCalled()
  })

  it("routes manual captures to the manual handler", async () => {
    const qr = vi.fn(async () => "qr")
    const manual = vi.fn(async (identifierType: "UIN" | "PCN", identifier: string) => {
      return `${identifierType}:${identifier}`
    })

    await expect(
      submitIdentifierCapture(
        {
          kind: "manual",
          identifierType: "UIN",
          identifier: "uin-123",
        },
        { qr, manual }
      )
    ).resolves.toBe("UIN:uin-123")

    expect(manual).toHaveBeenCalledWith("UIN", "uin-123")
    expect(qr).not.toHaveBeenCalled()
  })
})
