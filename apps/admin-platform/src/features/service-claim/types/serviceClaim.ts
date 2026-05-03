/* Types for service claiming dashboard and claim operations. */

export type ClaimType = "onetime" | "periodic"
export type RefreshInterval = "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
export type StocksType = "unlimited" | "limited"

export interface ServiceItem {
  id: string
  name: string
  description: string
  max_claims_per_user: number
  claim_type: ClaimType
  refresh_interval: RefreshInterval | null
  stocks_type: StocksType
  stocks: number | null
  active: boolean
  recipient_sectors: string[]
  allowed_groups: number[]
}

export interface ClaimItem {
  user: string
  claimed_by: string
  service: string
  claimed_at: string
}

export interface CreateServicePayload {
  name: string
  verbose_name: string
  description: string
  max_claims_per_user: number
  claim_type: ClaimType
  refresh_interval: string | null
  stocks_type: StocksType
  stocks: number
  active: boolean
  recepient_sectors: string[]
  allowed_groups: number[]
}
