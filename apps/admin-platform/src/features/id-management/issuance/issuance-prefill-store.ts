export interface IssuancePrefillData {
  first_name?: string
  middle_name?: string
  last_name?: string
  suffix_name?: string
  gender?: string
  dob?: string
  address?: string
  contact_number?: string
  pcn?: string
  face_image?: string
}

let cachedPrefill: IssuancePrefillData | null = null
const prefillListeners = new Set<(prefill: IssuancePrefillData | null) => void>()

function notifyPrefillListeners() {
  for (const listener of prefillListeners) {
    listener(cachedPrefill)
  }
}

export function setIssuancePrefill(data: IssuancePrefillData): void {
  cachedPrefill = data
  notifyPrefillListeners()
}

export function getIssuancePrefill(): IssuancePrefillData | null {
  return cachedPrefill
}

export function clearIssuancePrefill(): void {
  cachedPrefill = null
  notifyPrefillListeners()
}

export function subscribeIssuancePrefill(
  listener: (prefill: IssuancePrefillData | null) => void
): () => void {
  prefillListeners.add(listener)
  return () => {
    prefillListeners.delete(listener)
  }
}
