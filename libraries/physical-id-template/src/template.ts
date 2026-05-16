import type { Template } from "@pdfme/common"

import type { PhysicalLGUIDTemplateData } from "#types"

const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7/7GQAAAAASUVORK5CYII="

export const PHYSICAL_LGU_ID_PAGE_SIZE = {
  width: 86,
  height: 54,
  padding: [2, 2, 2, 2] as [number, number, number, number],
}

export const PHYSICAL_LGU_ID_TEMPLATE: Template = {
  basePdf: PHYSICAL_LGU_ID_PAGE_SIZE,
  schemas: [
    [
      {
        name: "face",
        type: "image",
        position: { x: 4, y: 6 },
        width: 18,
        height: 22,
      },
      {
        name: "full_name",
        type: "text",
        position: { x: 24, y: 7 },
        width: 58,
        height: 6,
        fontSize: 14,
        bold: true,
      },
      {
        name: "uin",
        type: "text",
        position: { x: 24, y: 15 },
        width: 32,
        height: 4,
        fontSize: 8,
      },
      {
        name: "pcn",
        type: "text",
        position: { x: 24, y: 20 },
        width: 32,
        height: 4,
        fontSize: 8,
      },
      {
        name: "dob",
        type: "text",
        position: { x: 24, y: 25 },
        width: 32,
        height: 4,
        fontSize: 8,
      },
      {
        name: "gender",
        type: "text",
        position: { x: 24, y: 30 },
        width: 32,
        height: 4,
        fontSize: 8,
      },
      {
        name: "address",
        type: "text",
        position: { x: 4, y: 37 },
        width: 34,
        height: 4,
        fontSize: 7,
      },
      {
        name: "qrValue",
        type: "qrcode",
        position: { x: 63, y: 33 },
        width: 18,
        height: 18,
      },
    ],
  ],
}

export function buildPhysicalLGUIDInputs(data: PhysicalLGUIDTemplateData) {
  return [
    {
      face: normalizeImageValue(data.face),
      full_name: data.full_name,
      uin: `UIN: ${data.uin}`,
      pcn: data.pcn ? `PCN: ${data.pcn}` : "PCN: —",
      dob: `DOB: ${data.dob}`,
      gender: `Gender: ${data.gender}`,
      address: `Address: ${data.address}`,
      qrValue: data.qrValue,
    },
  ]
}

function normalizeImageValue(image: string | undefined) {
  if (!image) {
    return TRANSPARENT_PIXEL
  }

  if (image.startsWith("data:image/")) {
    return image
  }

  return `data:image/png;base64,${image}`
}
