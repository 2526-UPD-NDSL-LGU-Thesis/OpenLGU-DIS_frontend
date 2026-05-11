import type { IdDetails } from "@openlguid/ui/features/verification/types/verification"

export interface SectorItem {
  id: string
  name: string
  description: string | null
  created_at: string
  resident_count: number
}

export interface CreateSectorPayload {
  name: string
  description?: string
  fromSectors?: string[]
}

export interface EnlistResponse {
  ok: true
  resident: IdDetails
  message?: string
}
