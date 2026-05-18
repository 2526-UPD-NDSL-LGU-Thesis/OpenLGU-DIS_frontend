import { useRef } from "react"
import { Link } from "@tanstack/react-router"

import { Button } from "@openlguid/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"
import { PhysicalLGUIDPreview } from "@openlguid/physical-id-template/preview"
import type { PhysicalLGUIDTemplateData } from "@openlguid/physical-id-template/types"

interface IdPreviewSuccessPageProps {
  data: PhysicalLGUIDTemplateData
  title?: string
  subtitle?: string
}

export function IdPreviewSuccessPage({
  data,
  title = "ID ready to print",
  subtitle = "Review the Physical LGU ID preview before printing or downloading.",
}: IdPreviewSuccessPageProps) {
  const previewRef = useRef<HTMLDivElement | null>(null)

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
        <div ref={previewRef} className="rounded-2xl border border-border/70 bg-muted/40 p-4">
          <PhysicalLGUIDPreview data={data} className="min-h-[16rem]" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleOpenPrint}>Print ID</Button>
          <Button variant="outline" onClick={handleDownload}>
            Download PDF
          </Button>
          <Button variant="outline" asChild>
            <Link to="/id-management">Back to dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
