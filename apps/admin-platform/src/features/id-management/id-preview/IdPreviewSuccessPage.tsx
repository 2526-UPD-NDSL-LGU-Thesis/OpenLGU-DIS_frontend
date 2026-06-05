import { type MouseEvent, type ReactNode, useEffect, useRef } from "react"
import { Link } from "@tanstack/react-router"

import { Button } from "@openlguid/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"
import { PhysicalLGUIDPreview } from "@openlguid/physical-id-template/components/PhysicalLGUIDPreview.tsx"
import type { PhysicalLGUIDTemplateData } from "@openlguid/physical-id-template/types.ts"

interface IdPreviewSuccessPageProps {
  data: PhysicalLGUIDTemplateData
  title?: string
  subtitle?: string
  details?: ReactNode
  autoOpenPrintOnMount?: boolean
  onBackToDashboardClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function IdPreviewSuccessPage({
  data,
  title = "ID ready to print",
  subtitle = "Review the Physical LGU ID preview before printing or downloading.",
  details,
  autoOpenPrintOnMount = false,
  onBackToDashboardClick,
}: IdPreviewSuccessPageProps) {
  const previewRef = useRef<HTMLDivElement | null>(null)
  const hasAutoOpenedRef = useRef(false)

  function getPreviewUrl(): string | null {
    const iframe = previewRef.current?.querySelector<HTMLIFrameElement>(
      'iframe[title="Physical LGU ID preview"]'
    )
    return iframe?.src ?? null
  }

  function handleOpenPrint() {
    const url = getPreviewUrl()
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  useEffect(() => {
    if (!autoOpenPrintOnMount || hasAutoOpenedRef.current) {
      return
    }

    const url = getPreviewUrl()
    if (!url) {
      return
    }

    window.open(url, "_blank", "noopener,noreferrer")
    hasAutoOpenedRef.current = true
  }, [autoOpenPrintOnMount])

  function handleDownload() {
    const url = getPreviewUrl()
    if (!url) {
      return
    }
    const link = document.createElement("a")
    link.href = url
    link.download = "physical-lgu-id.pdf"
    link.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {details}
        <div ref={previewRef} className="rounded-2xl border border-border/70 bg-muted/40 p-4">
          <PhysicalLGUIDPreview data={data} className="h-[36rem]" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleOpenPrint}>Print ID</Button>
          <Button variant="outline" onClick={handleDownload}>
            Download PDF
          </Button>
          <Button variant="outline" asChild>
            <Link to="/id-management" onClick={onBackToDashboardClick}>
              Back to dashboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
