import { useEffect, useMemo, useState } from "react"

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
  const [{ generate }, { barcodes, image }] = await Promise.all([
    import("@pdfme/generator"),
    import("@pdfme/schemas"),
  ])

  return {
    generate,
    plugins: {
      Image: image,
      "QR Code": barcodes.qrcode,
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

  const inputs = useMemo(() => buildPhysicalLGUIDInputs(data), [data])

  useEffect(() => {
    let isActive = true
    let nextUrl: string | null = null

    setStatus("loading")

    void loadPdfme()
      .then(async ({ generate, plugins }: PdfmePreviewDependencies) => {
        const pdf = await generate({
          template: PHYSICAL_LGU_ID_TEMPLATE,
          inputs,
          plugins: plugins as import("@pdfme/common").Plugins,
        })

        if (!isActive) {
          return
        }

        const blob = new Blob([pdf], { type: "application/pdf" })
        nextUrl = URL.createObjectURL(blob)
        setPdfUrl(nextUrl)
        setStatus("ready")
      })
      .catch(() => {
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
  }, [inputs, loadPdfme])

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
