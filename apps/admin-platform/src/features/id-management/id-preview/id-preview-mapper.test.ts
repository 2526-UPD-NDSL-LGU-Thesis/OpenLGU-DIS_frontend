// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { buildQrFromString } = vi.hoisted(() => ({
  buildQrFromString: vi.fn(async () => {
    throw new Error("qr-generator-should-not-be-called")
  }),
}))

vi.mock("#/lib/buildQrFromString", () => ({
  buildQrFromString,
}))

import { buildPhysicalIdTemplateDataFromSource } from "./id-preview-mapper"

class MockImage {
  width = 2
  height = 2
  onload: null | (() => void) = null
  onerror: null | (() => void) = null

  set src(_value: string) {
    queueMicrotask(() => {
      this.onload?.()
    })
  }
}

beforeEach(() => {
  vi.stubGlobal("Image", MockImage)
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/png;base64,converted-qr"
  )
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

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

  it("converts webp QR payloads to png before returning", async () => {
    const qrWebpBase64 = "UklGRlIAAABXRUJQVlA4IC4AAABwAgCdASoEAAQAAVAfCWkA"

    const data = await buildPhysicalIdTemplateDataFromSource(
      {
        first_name: "Juan",
        last_name: "Dela Cruz",
        uin: "UIN-2026-0002",
      },
      qrWebpBase64
    )

    expect(buildQrFromString).not.toHaveBeenCalled()
    expect(data.qrValue).toBe("data:image/png;base64,converted-qr")
  })
})
