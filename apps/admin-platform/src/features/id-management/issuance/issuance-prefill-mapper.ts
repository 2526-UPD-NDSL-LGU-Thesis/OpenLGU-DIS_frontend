import type { NationalIdVerificationDetails } from "./nationalIdVerification"
import type { IssuancePrefillData } from "#/features/id-management/issuance/issuance-prefill-store"

export function mapNationalIdToIssuancePrefill(
  details: NationalIdVerificationDetails
): IssuancePrefillData {
  return {
    first_name: details.first_name,
    middle_name: details.middle_name,
    last_name: details.last_name,
    suffix_name: details.suffix_name,
    gender: details.gender,
    dob: details.birthdate,
    address: details.address,
    contact_number: details.phone,
    pcn: details.pcn,
    face_image: details.face_image
  }
}
