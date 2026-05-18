import type { PhysicalLGUIDTemplateData } from "@openlguid/physical-id-template/types"
import type { IdDetails } from "@openlguid/ui/features/verification/types/verification"

import { buildQrFromString } from "#/lib/buildQrFromString"

export async function buildPhysicalIdTemplateData(details: IdDetails, qrValue: string): Promise<PhysicalLGUIDTemplateData> {

  const qrData = await buildQrFromString(qrValue);

  return {
    full_name: details.full_name,
    uin: details.uin,
    dob: details.dob,
    gender: details.gender,
    address: details.location ?? "",
    qrValue: qrData,
    face: details.face,
    pcn: details.pcn,
    phone: details.phone
  }
}
