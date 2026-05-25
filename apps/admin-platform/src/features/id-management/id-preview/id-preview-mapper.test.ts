import { describe, expect, it, vi } from "vitest"

const { buildQrFromString } = vi.hoisted(() => ({
  buildQrFromString: vi.fn(async () => {
    throw new Error("qr-generator-should-not-be-called")
  }),
}))

vi.mock("#/lib/buildQrFromString", () => ({
  buildQrFromString,
}))

import { buildPhysicalIdTemplateDataFromSource } from "./id-preview-mapper"

describe("buildPhysicalIdTemplateDataFromSource", () => {
  it("uses an issuance-provided base64 QR image without regenerating", async () => {
    const qrBase64 = "iVBORw0KGgoAAAANSUhEUgAA"

    const data = await buildPhysicalIdTemplateDataFromSource(
      {
        first_name: "Juan",
        last_name: "Dela Cruz",
        uin: "UIN-2026-0001",
      },
      qrBase64
    )

    expect(buildQrFromString).not.toHaveBeenCalled()
    expect(data.qrValue).toBe(`data:image/png;base64,${qrBase64}`)
  })
})
