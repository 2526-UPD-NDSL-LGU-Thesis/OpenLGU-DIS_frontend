import type { PhysicalLGUIDTemplateData } from "@openlguid/physical-id-template/types.ts"

let cachedPreview: PhysicalLGUIDTemplateData | null = null

export function setIdPreviewData(data: PhysicalLGUIDTemplateData): void {
  cachedPreview = data
}

export function getIdPreviewData(): PhysicalLGUIDTemplateData | null {
  return cachedPreview
}

export function clearIdPreviewData(): void {
  cachedPreview = null
}
