import { useEffect, useState } from "react"

import {
  buildPhysicalLGUIDInputs,
  PHYSICAL_LGU_ID_TEMPLATE,
} from "#template"
import type {
  PdfmePreviewDependencies,
  LoadPdfmeDependencies,
  PhysicalLGUIDPreviewProps,
} from "#types"

type RenderStatus = "loading" | "ready" | "error"

const defaultLoadPdfme: LoadPdfmeDependencies = async () => {
  const [{ generate }, { barcodes, image, text }] = await Promise.all([
    import("@pdfme/generator"),
    import("@pdfme/schemas"),
  ])

  return {
    generate,
    plugins: {
      Image: image,
      "QR Code": barcodes.qrcode,
      text,
    },
  }
}

export function PhysicalLGUIDPreview({
  data,
  className,
  loadingLabel = "Loading Physical LGU ID preview...",
  loadPdfme = defaultLoadPdfme,
}: PhysicalLGUIDPreviewProps) {
  const [status, setStatus] = useState<RenderStatus>("loading")
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    let nextUrl: string | null = null

    setStatus("loading")

    void (async () => {
      const normalizedInputs = await buildPhysicalLGUIDInputs(data)
      const { generate, plugins } = await loadPdfme()

      const pdf = await generate({
        template: PHYSICAL_LGU_ID_TEMPLATE,
        inputs: normalizedInputs,
        plugins: plugins as import("@pdfme/common").Plugins,
      })

      if (!isActive) {
        return
      }

      const blob = new Blob([pdf], { type: "application/pdf" })
      nextUrl = URL.createObjectURL(blob)
      setPdfUrl(nextUrl)
      setStatus("ready")
    })().catch((err) => {
      console.error("pdfme generation failed:", err)
      if (isActive) {
        setStatus("error")
      }
    })

    return () => {
      isActive = false
      if (nextUrl) {
        URL.revokeObjectURL(nextUrl)
      }
    }
  }, [data, loadPdfme])

  if (status === "error") {
    return (
      <div className={className} role="alert">
        Failed to load the Physical LGU ID preview.
      </div>
    )
  }

  return (
    <div className={className}>
      {status === "loading" ? <p>{loadingLabel}</p> : null}
      <iframe
        title="Physical LGU ID preview"
        src={pdfUrl ?? undefined}
        className="h-full w-full rounded-xl border bg-white"
      />
    </div>
  )
}
