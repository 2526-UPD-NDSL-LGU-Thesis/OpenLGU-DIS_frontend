export interface IssuanceSubmissionValues {
  first_name: string
  middle_name?: string
  last_name: string
  gender?: string
  pcn?: string
  dob?: string
  address?: string
  contact_number?: string
  sectors?: string[]
}

export function buildIssuanceSubmissionFormData(
  values: IssuanceSubmissionValues,
  proof: File
): FormData {
  const formData = new FormData()

  formData.append(
    "payload",
    JSON.stringify({
      ...values,
      middle_name: values.middle_name ?? "",
      gender: values.gender ?? "",
      pcn: values.pcn ?? "",
      dob: values.dob ?? "",
      address: values.address ?? "",
      contact_number: values.contact_number ?? "",
      sectors: values.sectors ?? [],
    })
  )
  formData.append("proof", proof)

  return formData
}
