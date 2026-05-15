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
  pcn: string
  uin: string
  issued_at: string
  active: boolean
  email: string
  phone_number: string
  sector: string[]
  message?: string
}
