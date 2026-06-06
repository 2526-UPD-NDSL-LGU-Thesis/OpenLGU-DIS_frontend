import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react"
import { Camera, ImagePlus, Loader2, QrCode } from "lucide-react"

import { Button } from "@openlguid/ui/components/button"
import { Input } from "@openlguid/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@openlguid/ui/components/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@openlguid/ui/components/tabs"
import { useQRScanner } from "#features/verification/hooks/use-qr-scanner.js"

type CaptureMode = "qr" | "manual"

export type IdentifierCaptureRequest =
  | {
      kind: "qr"
      rawQRValue: string
    }


type CaptureScanResult =
  | {
      kind: "qr"
      rawQRValue: string
    }
  | {
      kind: "error"
      message: string
    }

export interface IdentifierCaptureDialogProps {
  open: boolean
  onOpenChange: (nextOpen: boolean) => void
  onSubmit: (request: IdentifierCaptureRequest) => Promise<void>
  onSubmittingChange?: (isSubmitting: boolean) => void
}

const CAPTURE_FAILURE_MESSAGE = "Capture failed. Please try again."
const QR_SCAN_FAILURE_MESSAGE =
  "Unable to decode QR from the provided camera frame or image."

export function IdentifierCaptureDialog({
  open,
  onOpenChange,
  onSubmit,
  onSubmittingChange,
}: IdentifierCaptureDialogProps) {
  const [activeTab, setActiveTab] = useState<CaptureMode>("qr")
  const [isDragging, setIsDragging] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasAutoStartedRef = useRef(false)
  const hasEmittedResultRef = useRef(false)
  const fileInputId = useId()

  const {
    videoRef,
    startWebcamScan,
    stopWebcamScan,
    isScanning,
    handleFileUpload,
    scanResult,
    isLoading,
    reset,
  } = useQRScanner<CaptureScanResult>({
    onDecode: async (rawQRValue) => ({
      kind: "qr",
      rawQRValue,
    }),
    onScanError: () => ({
      kind: "error",
      message: QR_SCAN_FAILURE_MESSAGE,
    }),
  })

  const isBusy = isLoading || isSubmitting

  const resetCaptureState = useCallback(() => {
    hasAutoStartedRef.current = false
    hasEmittedResultRef.current = false
    setIsSubmitting(false)
  }, [])

  useEffect(() => {
    onSubmittingChange?.(isBusy)
  }, [isBusy, onSubmittingChange])


  useEffect(() => {
    if (!open) {
      resetCaptureState()
      setSubmissionError(null)
      return
    }

    if (activeTab === "qr" && !isScanning && !isLoading && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true
      const frameId = requestAnimationFrame(() => {
        startWebcamScan()
      })

      return () => {
        cancelAnimationFrame(frameId)
      }
    }

    if (activeTab !== "qr" && isScanning) {
      stopWebcamScan()
    }
  }, [
    activeTab,
    isLoading,
    isScanning,
    open,
    resetCaptureState,
    startWebcamScan,
    stopWebcamScan,
  ])

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)

    if (!nextOpen) {
      reset()
      setActiveTab("qr")
      setSubmissionError(null)
      resetCaptureState()
      onSubmittingChange?.(false)
    } else {
      hasEmittedResultRef.current = false
    }
  }

  const processFile = (file: File | undefined) => {
    if (!file || isBusy) {
      return
    }

    setSubmissionError(null)
    handleFileUpload(file)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    processFile(file)
    event.target.value = ""
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    processFile(file)
  }

  const submitCapture = useCallback(
    async (request: IdentifierCaptureRequest) => {
    setSubmissionError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(request)
      onOpenChange(false)
      reset()
      resetCaptureState()
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : CAPTURE_FAILURE_MESSAGE
      )
    } finally {
      setIsSubmitting(false)
      onSubmittingChange?.(false)
    }
    },
    [onOpenChange, onSubmit, onSubmittingChange, reset, resetCaptureState]
  )

  useEffect(() => {
    if (!open || !scanResult || hasEmittedResultRef.current) {
      return
    }

    hasEmittedResultRef.current = true

    if (scanResult.kind === "error") {
      setSubmissionError(scanResult.message)
      reset()
      resetCaptureState()
      return
    }

    void submitCapture({
      kind: "qr",
      rawQRValue: scanResult.rawQRValue,
    })
  }, [open, reset, resetCaptureState, scanResult, submitCapture])



  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Capture Resident Identifier</DialogTitle>
          <DialogDescription>
            Use the webcam or upload an image of the ID QR.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as CaptureMode)}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="qr" className="gap-1.5">
              <Camera className="size-4" />
              Use Webcam
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-1.5">
              <ImagePlus className="size-4" />
              Upload Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="space-y-4 pt-3">
            <div className="relative overflow-hidden rounded-2xl border bg-muted/20">
              <video
                ref={videoRef}
                autoPlay
                muted
                className={`h-65 w-full object-cover sm:h-80 ${isScanning ? "block" : "hidden"}`}
              />

              {!isScanning ? (
                <div className="flex h-65 flex-col items-center justify-center gap-2 text-muted-foreground sm:h-80">
                  {isBusy ? (
                    <Loader2 className="size-8 animate-spin" />
                  ) : (
                    <QrCode className="size-8" />
                  )}
                  <p className="text-sm">
                    {isBusy ? "Capturing..." : "Starting webcam scanner..."}
                  </p>
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="pt-3">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex min-h-55 w-full flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/20"}`}
            >
              <p className="mb-3 text-sm text-muted-foreground">
                Drag and drop a QR image here, or choose a file.
              </p>

              <label
                htmlFor={fileInputId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {isBusy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ImagePlus className="size-4" />
                )}
                <span>{isBusy ? "Processing..." : "Select Image"}</span>
              </label>

              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
                disabled={isBusy}
              />
            </div>
          </TabsContent>

        </Tabs>

        {submissionError ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submissionError}
          </p>
        ) : null}

        <div className="text-xs text-muted-foreground">
          {isBusy ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" />
              Capturing identifier...
            </span>
          ) : (
            <span>Close with the top-right X to cancel capture.</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
