import type { PhysicalLGUIDTemplateData } from "@openlguid/physical-id-template/types"
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

async function resolveQrValue(qrValue: string): Promise<string> {
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
      dob: details.dob,
      gender: details.gender,
      address: details.pob ?? "",
      phone: details.phone,
      face: details.face,
      uin: details.uin
    },
    qrValue
  )
}
