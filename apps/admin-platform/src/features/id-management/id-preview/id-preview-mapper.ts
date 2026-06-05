import type { PhysicalLGUIDTemplateData } from "@openlguid/physical-id-template/types.ts"
import type { IdDetails } from "@openlguid/ui/features/verification/types/verification"

import { buildQrFromString } from "#/lib/buildQrFromString"

export interface IdPreviewSource {
  first_name: string
  middle_name?: string
  last_name: string
  suffix_name?: string
  dob?: string
  gender?: string
  address?: string
  phone?: string
  face?: string
  uin: string
}

function buildFullName(source: IdPreviewSource): string {
  return [
    source.first_name,
    source.middle_name,
    source.last_name,
    source.suffix_name,
  ]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join(" ")
}

function isBase64Png(value: string): boolean {
  return value.startsWith("iVBORw0KGgo")
}

function isBase64Jpeg(value: string): boolean {
  return value.startsWith("/9j/")
}

function isBase64Webp(value: string): boolean {
  return value.startsWith("UklGR")
}

function isWebpDataUrl(value: string): boolean {
  return value.startsWith("data:image/webp;")
}

function toWebpDataUrl(image: string): string | null {
  if (isWebpDataUrl(image)) {
    return image
  }

  if (isBase64Webp(image)) {
    return `data:image/webp;base64,${image}`
  }

  return null
}

async function convertWebpToPngDataUrl(image: string): Promise<string | null> {
  const webpDataUrl = toWebpDataUrl(image)
  if (!webpDataUrl) {
    return null
  }

  if (typeof Image === "undefined" || typeof document === "undefined") {
    return webpDataUrl
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
    return webpDataUrl
  }
  context.drawImage(decodedImage, 0, 0)
  return canvas.toDataURL("image/png")
}

async function resolveQrValue(qrValue: string): Promise<string> {
  if (isWebpDataUrl(qrValue) || isBase64Webp(qrValue)) {
    return (await convertWebpToPngDataUrl(qrValue)) ?? qrValue
  }

  if (qrValue.startsWith("data:image/")) {
    return qrValue
  }

  if (isBase64Png(qrValue)) {
    return `data:image/png;base64,${qrValue}`
  }

  if (isBase64Jpeg(qrValue)) {
    return `data:image/jpg;base64,${qrValue}`
  }

  return buildQrFromString(qrValue)
}

export async function buildPhysicalIdTemplateDataFromSource(
  source: IdPreviewSource,
  qrValue: string
): Promise<PhysicalLGUIDTemplateData> {
  const qrData = await resolveQrValue(qrValue)

  return {
    full_name: buildFullName(source),
    uin: source.uin,
    dob: source.dob ?? "",
    gender: source.gender ?? "",
    address: source.address ?? "",
    qrValue: qrData,
    face: source.face,
    phone: source.phone ?? "",
  }
}

export async function buildPhysicalIdTemplateData(
  details: IdDetails,
  qrValue: string
): Promise<PhysicalLGUIDTemplateData> {
  return buildPhysicalIdTemplateDataFromSource(
    {
      first_name: details.first_name,
      middle_name: details.middle_name,
      last_name: details.last_name,
      suffix_name: details.suffix_name,
      dob: details.date_of_birth,
      gender: details.gender,
      address: details.address ?? "",
      phone: details.phone_number,
      face: details.face_image,
      uin: details.uin
    },
    qrValue
  )
}
