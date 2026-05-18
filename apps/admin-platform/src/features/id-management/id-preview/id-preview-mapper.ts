import type { PhysicalLGUIDTemplateData } from "@openlguid/physical-id-template/types"
import type { IdDetails } from "@openlguid/ui/features/verification/types/verification"

export function buildPhysicalIdTemplateData(details: IdDetails): PhysicalLGUIDTemplateData {
  return {
    full_name: details.full_name,
    uin: details.uin,
    dob: details.dob,
    gender: details.gender,
    address: details.location ?? "",
    qrValue: details.uin,
    face: details.face,
    pcn: details.pcn,
  }
}
