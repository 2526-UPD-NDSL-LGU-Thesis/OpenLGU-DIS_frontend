import type { PhysicalLGUIDTemplateData } from "@openlguid/physical-id-template/types"

const REPRINT_CACHE_KEY = "openlguid:id-management:physical-lgu-id-reprint"
const REPRINT_CACHE_TTL_MS = 60 * 60 * 1000

interface CachedReprintPayload {
  savedAt: number
  data: PhysicalLGUIDTemplateData
}

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function readCachedPayload(): CachedReprintPayload | null {
  if (!canUseLocalStorage()) {
    return null
  }

  const raw = window.localStorage.getItem(REPRINT_CACHE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CachedReprintPayload>
    if (
      typeof parsed.savedAt !== "number" ||
      typeof parsed.data !== "object" ||
      parsed.data === null
    ) {
      return null
    }

    return {
      savedAt: parsed.savedAt,
      data: parsed.data as PhysicalLGUIDTemplateData,
    }
  } catch {
    return null
  }
}

export function savePhysicalIdReprintCache(data: PhysicalLGUIDTemplateData): void {
  if (!canUseLocalStorage()) {
    return
  }

  window.localStorage.setItem(
    REPRINT_CACHE_KEY,
    JSON.stringify({
      savedAt: Date.now(),
      data,
    } satisfies CachedReprintPayload)
  )
}

export function loadPhysicalIdReprintCache(): PhysicalLGUIDTemplateData | null {
  const payload = readCachedPayload()
  if (!payload) {
    return null
  }

  if (Date.now() - payload.savedAt > REPRINT_CACHE_TTL_MS) {
    clearPhysicalIdReprintCache()
    return null
  }

  return payload.data
}

export function clearPhysicalIdReprintCache(): void {
  if (!canUseLocalStorage()) {
    return
  }

  window.localStorage.removeItem(REPRINT_CACHE_KEY)
}

export async function logoutAndClearPhysicalIdReprintCache(
  logout: () => Promise<void>
): Promise<void> {
  try {
    await logout()
  } finally {
    clearPhysicalIdReprintCache()
  }
}

export { REPRINT_CACHE_TTL_MS }
