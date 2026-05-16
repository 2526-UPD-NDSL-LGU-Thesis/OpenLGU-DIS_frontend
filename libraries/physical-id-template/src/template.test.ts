import { describe, expect, it } from "vitest"

import {
  PHYSICAL_LGU_ID_PAGE_SIZE,
  PHYSICAL_LGU_ID_TEMPLATE,
  buildPhysicalLGUIDInputs,
} from "#template"

describe("PHYSICAL_LGU_ID_TEMPLATE", () => {
  it("describes the physical card layout with the expected fields", () => {
    expect(PHYSICAL_LGU_ID_PAGE_SIZE).toEqual({
      width: 86,
      height: 54,
      padding: [2, 2, 2, 2],
    })
    expect(PHYSICAL_LGU_ID_TEMPLATE.schemas).toHaveLength(1)
    expect(PHYSICAL_LGU_ID_TEMPLATE.schemas[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "face", type: "image" }),
        expect.objectContaining({ name: "full_name", type: "text" }),
        expect.objectContaining({ name: "uin", type: "text" }),
        expect.objectContaining({ name: "qrValue", type: "qrcode" }),
      ])
    )
  })
})

describe("buildPhysicalLGUIDInputs", () => {
  it("normalizes resident data into pdfme inputs", () => {
    expect(
      buildPhysicalLGUIDInputs({
        full_name: "Juan dela Cruz",
        uin: "UIN-123",
        dob: "2000-01-01",
        gender: "Male",
        address: "Brgy. 1",
        qrValue: "qr-payload",
      })
    ).toEqual([
      expect.objectContaining({
        full_name: "Juan dela Cruz",
        uin: "UIN: UIN-123",
        pcn: "PCN: —",
        dob: "DOB: 2000-01-01",
        gender: "Gender: Male",
        address: "Address: Brgy. 1",
        qrValue: "qr-payload",
      }),
    ])
  })
})
