// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { PhysicalLGUIDPreview } from "./PhysicalLGUIDPreview"
import { PHYSICAL_LGU_ID_TEMPLATE } from "#template"

const generate = vi.fn(async () => new Uint8Array([1, 2, 3]))
const createObjectURL = vi.fn(() => "blob:physical-id")
const revokeObjectURL = vi.fn()

beforeEach(() => {
  vi.stubGlobal("URL", {
    createObjectURL,
    revokeObjectURL,
  })
})

afterEach(() => {
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
})
