// TODO need to review this

import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { Camera, ImagePlus, Loader2, QrCode } from "lucide-react"

import { Button } from "@openlguid/ui/components/button"
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
import {
  verifyQR,
  type QRVerifyReturn,
} from "@openlguid/ui/features/verification/api/verificationService"
import { useQRScanner } from "#features/verification/hooks/use-qr-scanner.js"

interface VerificationDialogProps {
  open: boolean
  onOpenChange: (nextOpen: boolean) => void
  onVerificationResult: (result: QRVerifyReturn) => void
  onVerifyingChange?: (isVerifying: boolean) => void
}

export function VerificationDialog({
  open,
  onOpenChange,
  onVerificationResult,
  onVerifyingChange,
}: VerificationDialogProps) {
  const [activeTab, setActiveTab] = useState("webcam")
  const [isDragging, setIsDragging] = useState(false)
  const hasAutoStartedRef = useRef(false)
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
  } = useQRScanner<QRVerifyReturn>({
    onDecode: verifyQR,
    onScanError: () => ({
      result: "error_tampered",
      message: "Unable to decode QR from the provided camera frame or image.",
    }),
  })

  useEffect(() => {
    onVerifyingChange?.(isLoading)
  }, [isLoading, onVerifyingChange])

  useEffect(() => {
    if (!open) {
      hasAutoStartedRef.current = false
      return
    }

    if (activeTab === "webcam" && !isScanning && !isLoading && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true
      // Wait one frame so the dialog content/video is mounted before camera attach.
      const frameId = requestAnimationFrame(() => {
        startWebcamScan()
      })

      return () => {
        cancelAnimationFrame(frameId)
      }
    }

    if (activeTab === "upload" && isScanning) {
      hasAutoStartedRef.current = false
      stopWebcamScan()
    }
  }, [activeTab, isLoading, isScanning, open, startWebcamScan, stopWebcamScan])

  useEffect(() => {
    if (!scanResult) {
      return
    }

    onVerificationResult(scanResult)
    onOpenChange(false)
  }, [onOpenChange, onVerificationResult, scanResult])

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)

    if (!nextOpen) {
      reset()
      setActiveTab("webcam")
      hasAutoStartedRef.current = false
      onVerifyingChange?.(false)
    }
  }

  const processFile = (file: File | undefined) => {
    if (!file || isLoading) {
      return
    }

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Scan Resident ID</DialogTitle>
          <DialogDescription>
            Scanner starts automatically. Switch to Upload Image to verify from a file.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="webcam" className="gap-1.5">
              <Camera className="size-4" />
              Use Webcam
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-1.5">
              <ImagePlus className="size-4" />
              Upload Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="webcam" className="space-y-4 pt-3">
            <div className="relative overflow-hidden rounded-2xl border bg-muted/20">
              <video
                ref={videoRef}
                autoPlay
                muted
                className={`h-65 w-full object-cover sm:h-80 ${isScanning ? "block" : "hidden"}`}
              />

              {!isScanning ? (
                <div className="flex h-65 flex-col items-center justify-center gap-2 text-muted-foreground sm:h-80">
                  {isLoading ? <Loader2 className="size-8 animate-spin" /> : <QrCode className="size-8" />}
                  <p className="text-sm">
                    {isLoading ? "Verifying capture..." : "Starting webcam scanner..."}
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
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                <span>{isLoading ? "Processing..." : "Select Image"}</span>
              </label>

              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground">
          {isLoading ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" />
              Verifying scan...
            </span>
          ) : (
            <span>Close with the top-right X to cancel scanning.</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
