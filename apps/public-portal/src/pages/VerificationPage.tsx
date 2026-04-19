import { Loader2 } from "lucide-react"

import { Button } from "@openlguid/ui/components/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@openlguid/ui/components/tabs"

import { FileUploadScanner } from "../features/verification/components/FileUploadScanner.js"
import { ErrorCard } from "../components/ErrorCard.js"
import { ResidentProfileCard } from "../components/ResidentProfileCard.js"
import { WebcamScanner } from "../features/verification/components/WebcamScanner.js"
import { useQRScanner } from "../features/verification/hooks/useQRScanner.js"

export function VerificationPage() {
  const {
    videoRef,
    startWebcamScan,
    stopWebcamScan,
    isScanning,
    handleFileUpload,
    verificationResult,
    isLoading,
    reset,
  } = useQRScanner()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Verify a Resident&apos;s Identity
        </h1>
        <p className="text-muted-foreground">
          Scan an LGU ID or National ID QR code to verify a resident.
        </p>
      </header>

      <Tabs defaultValue="webcam" className="w-full">
        <TabsList>
          <TabsTrigger value="webcam">Use Webcam</TabsTrigger>
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
        </TabsList>

        <TabsContent value="webcam" className="pt-2">
          <WebcamScanner
            videoRef={videoRef}
            isScanning={isScanning}
            onStart={startWebcamScan}
            onStop={stopWebcamScan}
          />
        </TabsContent>

        <TabsContent value="upload" className="pt-2">
          <FileUploadScanner onFileSelect={handleFileUpload} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : null}

      {verificationResult ? (
        <section className="flex flex-col gap-4 pt-2">
          {verificationResult.result === "success" && verificationResult.idDetails ? (
            <ResidentProfileCard profile={verificationResult.idDetails} status={verificationResult.result} />
          ) : verificationResult.result === "random_qr" || verificationResult.result === "error_tampered" || verificationResult.result === "error_not_registered" ? (
            <ErrorCard status={verificationResult.result} />
          ) : null}

          <div>
            <Button type="button" variant="outline" onClick={reset}>
              Scan Again
            </Button>
          </div>
        </section>
      ) : null}
    </main>
  )
}
