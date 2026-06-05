export interface PhysicalLGUIDTemplateData {
  full_name: string
  uin: string
  dob: string
  gender: string
  address: string
  phone: string
  qrValue: string
  face?: string
  pcn?: string
}

export interface PhysicalLGUIDPreviewProps {
  data: PhysicalLGUIDTemplateData
  className?: string
  loadingLabel?: string
  loadPdfme?: LoadPdfmeDependencies
}

export interface PdfmePreviewDependencies {
  generate: typeof import("@pdfme/generator").generate
  plugins: Record<string, unknown>
}

export type LoadPdfmeDependencies = () => Promise<PdfmePreviewDependencies>
