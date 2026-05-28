// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { PhysicalLGUIDPreview } from "./PhysicalLGUIDPreview"
import { PHYSICAL_LGU_ID_TEMPLATE } from "#template"

const generate = vi.fn(async () => new Uint8Array([1, 2, 3]))
const createObjectURL = vi.fn(() => "blob:physical-id")
const revokeObjectURL = vi.fn()

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
  vi.stubGlobal("URL", {
    createObjectURL,
    revokeObjectURL,
  })
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

describe("PhysicalLGUIDPreview", () => {
  it("lazy loads pdfme and renders a generated preview for the provided card data", async () => {
    const loadPdfme = vi.fn(async () => ({
      generate,
      plugins: { Image: {}, "QR Code": {} },
    }))

    render(
      <PhysicalLGUIDPreview
        data={{
          full_name: "Juan dela Cruz",
          uin: "UIN-123",
          dob: "2000-01-01",
          gender: "Male",
          address: "Brgy. Common",
          phone: "0917 000 0000",
          qrValue: "qr-payload",
        }}
        loadPdfme={loadPdfme}
      />
    )

    expect(screen.getByText(/loading physical lgu id preview/i).textContent).toMatch(
      /loading physical lgu id preview/i
    )

    await waitFor(() => {
      expect(loadPdfme).toHaveBeenCalledTimes(1)
      expect(generate).toHaveBeenCalledWith({
        template: PHYSICAL_LGU_ID_TEMPLATE,
        inputs: [
          expect.objectContaining({
            full_name: "Juan dela Cruz",
            uin: "UIN: UIN-123",
            address: "Address: Brgy. Common",
          }),
        ],
        plugins: { Image: {}, "QR Code": {} },
      })
      expect(createObjectURL).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByTitle("Physical LGU ID preview").getAttribute("src")).toBe(
      "blob:physical-id"
    )
  })

  it("converts webp faces to png before generating the pdf", async () => {
    const loadPdfme = vi.fn(async () => ({
      generate,
      plugins: { Image: {}, "QR Code": {} },
    }))

    render(
      <PhysicalLGUIDPreview
        data={{
          full_name: "Juan dela Cruz",
          uin: "UIN-123",
          dob: "2000-01-01",
          gender: "Male",
          address: "Brgy. Common",
          phone: "0917 000 0000",
          qrValue: "qr-payload",
          face: "UklGRkwBAABXRUJQVlA4IEABAADwCACdASotAC0APzmQu1cvKaWjqrqqqeAnCWkAFHYe9JDu0frW4tRwRxkoA1h5KCDPIvQJG24lTPjm5f5t23XLuWkldRViFfKajeWh7BB+AAD+7L41ZACeF7UEyo3YEvQglLP3FVOG4ui0vabKS80CrMCN45sVapOQCLdREMeVPoBYFoOsXaH+fJQ5cZM0yDhS6i/b4vRkt8Wq9Di1x4owsprb+Y8m8738rK6/0fDimGO9mCXm5skpHjaurn/JknQDWGYEHUIyGevNKssE0iEnwgpai5yhiq/Mb2BOYHZoAk7u1Bq4OPOXINLrKsFxG+HL7RlnZYykhglF/nGrZvFYR7S9ZDk2OacXjd8UadXGZJTi6/9ZM5By+DY0ztxt70WCsuNaI6bcIwBS92YYGp++Q6nf9jtZzha3bN+OAgAAAA==",
        }}
        loadPdfme={loadPdfme}
      />
    )

    await waitFor(() => {
      expect(generate).toHaveBeenCalledWith(
        expect.objectContaining({
          inputs: [
            expect.objectContaining({
              face: "data:image/png;base64,converted",
            }),
          ],
        })
      )
    })
  })
})
