import type { Template } from "@pdfme/common"

import type { PhysicalLGUIDTemplateData } from "#types"


// const response = await fetch("/LGU_ID_Background.pdf")
// const templateArrayBuffer = await response.arrayBuffer()

const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7/7GQAAAAASUVORK5CYII="

type PhysicalLGUIDInput = {
  face: string
  full_name: string
  uin: string
  dob: string
  gender: string
  address: string
  qrValue: string
  phone: string
}

export const PHYSICAL_LGU_ID_PAGE_SIZE = {
  width: 81,
  height: 54,
  padding: [2, 2, 2, 2] as [number, number, number, number],
}

export const PHYSICAL_LGU_ID_TEMPLATE: Template = {
  basePdf: PHYSICAL_LGU_ID_PAGE_SIZE,
  schemas: [
    [
      {
        "name": "face",
        "type": "image",
        "position": {
          "x": 3.21,
          "y": 18.96
        },
        "width": 20,
        "height": 22,
        "content": "",
        "readOnly": false
      },
      {
        "name": "full_name",
        "type": "text",
        "position": {
          "x": 25.36,
          "y": 17.85
        },
        "width": 51.06,
        "height": 3.44,
        "fontSize": 8,
        "bold": true,
        "content": "",
        "readOnly": false,
        "fontName": "Roboto",
        "overflow": "visible"
      },
      {
        "name": "uin",
        "type": "text",
        "position": {
          "x": 25.33,
          "y": 25.58
        },
        "width": 22.49,
        "height": 2.91,
        "fontSize": 7,
        "content": "",
        "readOnly": false,
        "fontName": "Roboto",
        "overflow": "visible"
      },
      {
        "name": "dob",
        "type": "text",
        "position": {
          "x": 52.84,
          "y": 25.79
        },
        "width": 22.75,
        "height": 2.91,
        "fontSize": 6.5,
        "content": "",
        "readOnly": false,
        "fontName": "Roboto",
        "overflow": "visible"
      },
      {
        "name": "gender",
        "type": "text",
        "position": {
          "x": 26.12,
          "y": 30.26
        },
        "width": 19.58,
        "height": 2.91,
        "fontSize": 6.5,
        "content": "",
        "readOnly": false,
        "fontName": "Roboto",
        "overflow": "visible"
      },
      {
        "name": "phone",
        "type": "text",
        "position": {
          "x": 56.28,
          "y": 31.02
        },
        "width": 18.26,
        "height": 2.91,
        "fontSize": 6,
        "content": "",
        "readOnly": false,
        "fontName": "Roboto",
        "overflow": "visible"
      },
      {
        "name": "address",
        "type": "text",
        "position": {
          "x": 25.69,
          "y": 37.25
        },
        "width": 51.33,
        "height": 7.41,
        "fontSize": 6,
        "content": "",
        "readOnly": false,
        "fontName": "Roboto",
        "overflow": "visible"
      }
    ],
    [
      {
        "name": "qrValue",
        "type": "image",
        "position": {
          "x": 28.76,
          "y": 2.5
        },
        "width": 50,
        "height": 50,
        "content": ""
      }
    ]
  ]
}

function isBase64Webp(value: string): boolean {
  return value.startsWith("UklGR")
}

function isBase64Png(value: string): boolean {
  return value.startsWith("iVBORw0KGgo")
}

function isBase64Jpeg(value: string): boolean {
  return value.startsWith("/9j/")
}

function isWebpDataUrl(value: string) {
  return value.startsWith("data:image/webp;")
}

function isRawWebpBase64(value: string) {
  return value.startsWith("UklGR")
}

function toWebpDataUrl(image: string) {
  if (isWebpDataUrl(image)) {
    return image
  }

  if (isRawWebpBase64(image)) {
    return `data:image/webp;base64,${image}`
  }

  return null
}

async function convertWebpToPngDataUrl(image: string) {
  const webpDataUrl = toWebpDataUrl(image)

  if (!webpDataUrl) {
    return null
  }

  if (typeof Image === "undefined" || typeof document === "undefined") {
    return TRANSPARENT_PIXEL
  }

  const decodedImage = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image()

    nextImage.onload = () => resolve(nextImage)
    nextImage.onerror = () => reject(new Error("Failed to decode WebP image"))
    nextImage.src = webpDataUrl
  })

  const canvas = document.createElement("canvas")
  canvas.width = decodedImage.width
  canvas.height = decodedImage.height

  const context = canvas.getContext("2d")

  if (!context) {
    return TRANSPARENT_PIXEL
  }

  context.drawImage(decodedImage, 0, 0)

  return canvas.toDataURL("image/png")
}

async function normalizeImageValue(image: string | undefined) {
  if (!image) {
    return TRANSPARENT_PIXEL
  }

  if (image.startsWith("data:image/webp;")) {
    return (await convertWebpToPngDataUrl(image)) ?? TRANSPARENT_PIXEL
  }

  if (image.startsWith("data:image/")) {
    return image
  }

  if (isBase64Webp(image)) {
    return (await convertWebpToPngDataUrl(image)) ?? TRANSPARENT_PIXEL
  }

  if (isBase64Jpeg(image)) {
    return `data:image/jpeg;base64,${image}`
  }

  if (isBase64Png(image)) {
    return `data:image/png;base64,${image}`
  }

  return TRANSPARENT_PIXEL
}

export async function buildPhysicalLGUIDInputs(
  data: PhysicalLGUIDTemplateData
): Promise<PhysicalLGUIDInput[]> {
  return [
    {
      face: await normalizeImageValue(data.face),
      full_name: data.full_name,
      uin: `UIN: ${data.uin}`,
      dob: `DOB: ${data.dob}`,
      gender: `Gender: ${data.gender}`,
      address: `Address: ${data.address}`,
      qrValue: data.qrValue,
      phone: `Phone: ${data.phone}`,
    },
  ]
}