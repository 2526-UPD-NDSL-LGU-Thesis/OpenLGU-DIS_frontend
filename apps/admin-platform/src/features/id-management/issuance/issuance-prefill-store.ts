export interface IssuancePrefillData {
  first_name?: string
  middle_name?: string
  last_name?: string
  gender?: string
  dob?: string
  address?: string
  contact_number?: string
  pcn?: string
}

let cachedPrefill: IssuancePrefillData | null = null

export function setIssuancePrefill(data: IssuancePrefillData): void {
  cachedPrefill = data
}

export function getIssuancePrefill(): IssuancePrefillData | null {
  return cachedPrefill
}

export function clearIssuancePrefill(): void {
  cachedPrefill = null
}
