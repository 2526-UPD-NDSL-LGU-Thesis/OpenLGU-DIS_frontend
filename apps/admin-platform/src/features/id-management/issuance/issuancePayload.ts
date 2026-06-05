export interface IssuanceSubmissionValues {
  first_name: string
  middle_name?: string
  last_name: string
  suffix_name?: string
  gender?: string
  pcn?: string
  dob?: string
  address?: string
  email_id?: string
  contact_number?: string
  phone_number?: string
  sectors?: string[]
  profile_image?: File | Blob | null
  profile_image_data?: string
}

export interface IssuanceEnrollResponseIdDetails {
  pcn?: string
  first_name?: string
  middle_name?: string
  last_name?: string
  suffix_name?: string
  date_of_birth?: string
  gender?: string
  address?: string
  email_id?: string
  phone_number?: string
  uin?: string
  face_image?: string
}

export interface IssuanceEnrollResponseBody {
  id_details?: IssuanceEnrollResponseIdDetails
  qr?: string
}

export function buildIssuanceSubmissionFormData(
  values: IssuanceSubmissionValues,
  proof: File
): FormData {
  const formData = new FormData()

  formData.append("pcn", values.pcn ?? "")
  formData.append("profile_image", values.profile_image_data ?? "")
  formData.append("first_name", values.first_name)
  formData.append("middle_name", values.middle_name ?? "")
  formData.append("last_name", values.last_name)
  formData.append("suffix_name", values.suffix_name ?? "")
  formData.append("date_of_birth", values.dob ?? "")
  formData.append("gender", values.gender ?? "")
  formData.append("address", values.address ?? "")
  formData.append("email_id", values.email_id ?? "")
  formData.append("phone_number", values.phone_number ?? values.contact_number ?? "")
  formData.append("proof_of_residence", proof)

  return formData
}
