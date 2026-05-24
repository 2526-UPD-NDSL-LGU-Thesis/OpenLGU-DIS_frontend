import type { PhysicalLGUIDTemplateData } from "@openlguid/physical-id-template/types"

export interface IssuanceSuccessData {
  uin: string
  pcn?: string
  qr: string
  preview: PhysicalLGUIDTemplateData
}

let cachedSuccessData: IssuanceSuccessData | null = null

export function setIssuanceSuccessData(data: IssuanceSuccessData): void {
  cachedSuccessData = data
}

export function getIssuanceSuccessData(): IssuanceSuccessData | null {
  return cachedSuccessData
}

export function clearIssuanceSuccessData(): void {
  cachedSuccessData = null
}
