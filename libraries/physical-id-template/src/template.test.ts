// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { buildPhysicalLGUIDInputs, getPhysicalLGUIDTemplate } from "./template"

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
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    }))
  )
  vi.stubGlobal("Image", MockImage)
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/png;base64,converted"
  )
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("buildPhysicalLGUIDInputs", () => {
  it("keeps data URLs intact", async () => {
    const inputs = (await buildPhysicalLGUIDInputs({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      phone: "0917 000 0000",
      qrValue: "qr-payload",
      face: "data:image/png;base64,ZmFrZS1mYWtl",
    }))[0]!

    expect(inputs.face).toBe("data:image/png;base64,ZmFrZS1mYWtl")
  })

  it("normalizes raw png and jpeg payloads", async () => {
    const pngInputs = (await buildPhysicalLGUIDInputs({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      phone: "0917 000 0000",
      qrValue: "qr-payload",
      face: "iVBORw0KGgoAAAANSUhEUgAA",
    }))[0]!

    const jpegInputs = (await buildPhysicalLGUIDInputs({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      phone: "0917 000 0000",
      qrValue: "qr-payload",
      face: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
    }))[0]!

    expect(pngInputs.face).toBe("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA")
    expect(jpegInputs.face).toBe(
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/"
    )
  })

  it("normalizes raw webp payloads", async () => {
    const inputs = (await buildPhysicalLGUIDInputs({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      phone: "0917 000 0000",
      qrValue: "qr-payload",
      face: "UklGRlIAAABXRUJQVlA4IC4AAABwAgCdASoEAAQAAVAfCWkA",
    }))[0]!

    expect(inputs.face).toBe("data:image/png;base64,converted")
  })

  it("falls back to a transparent pixel for unknown face payloads", async () => {
    const inputs = (await buildPhysicalLGUIDInputs({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      phone: "0917 000 0000",
      qrValue: "qr-payload",
      face: "not-an-image",
    }))[0]!

    expect(inputs.face).toBe(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7/7GQAAAAASUVORK5CYII="
    )
  })

  it("loads the PDF background as the template basePdf", async () => {
    const template = await getPhysicalLGUIDTemplate()

    expect(template.basePdf).toBeInstanceOf(ArrayBuffer)
  })
})