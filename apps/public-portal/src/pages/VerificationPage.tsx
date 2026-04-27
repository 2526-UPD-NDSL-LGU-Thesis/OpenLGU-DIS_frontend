/* Verification page for resident ID scanning and status display. */

import { AlertTriangle, CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react"
import { useState } from "react"

import { Button } from "@openlguid/ui/components/button"
import { 
  Card,
  CardDescription,
  CardHeader,
  CardContent,
  CardTitle, 
} from "@openlguid/ui/components/card"
import {
  VerificationDialog,
} from "@openlguid/ui/features/verification/components/VerificationDialog"
import type {
  QRVerifyReturn,
} from "@openlguid/ui/features/verification/api/verificationService"

import { ResidentProfileCard } from "#/components/ResidentProfileCard.js"
import { getMockVerificationResult } from "#/tests/utility/mockVerificationData.ts"

// TODO: Remove Mocking Data
// TODO: need to review this UI code here better
// TODO: Also need to handle spectacular error e.g., if error message returned is missing or error_response_is_not_declared_json or completely unexpected as it just stays in Checking or says Verification failed. Instead, this should say network error

// import { verifyQR, type QRVerifyReturn } from "#/features/verification/api/verificationService.js"

export function VerificationPage() {
  const [verificationData, setVerificationData] = useState<QRVerifyReturn>({ result: "idle" })
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const statusCardData = (() => { // TODO: refactor this as it seems this anonymous function / object is confusing?
    if (isVerifying) {
      return {
        label: "Checking",
        title: "Verifying QR code",
        subtitle: "Please wait while we validate the scanned identity record.",
        icon: Loader2,
        iconClassName: "animate-spin text-amber-700",
        iconWrapperClassName: "bg-amber-100",
        cardClassName: "border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background",
        labelClassName: "border border-amber-500/30 bg-amber-500/10 text-amber-700",
      }
    }

    switch (verificationData.result) {
      case "success":
        return {
          label: "Verified",
          title: "Identity confirmed",
          subtitle: "This QR code is valid and belongs to a registered resident.",
          icon: CheckCircle2,
          iconClassName: "text-emerald-700",
          iconWrapperClassName: "bg-emerald-100",
          cardClassName: "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background",
          labelClassName: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
        }
      case "idle":
        return {
          label: "Waiting",
          title: "Ready to scan",
          subtitle: "Scan an LGU or National ID QR code to begin verification.",
          icon: Clock3,
          iconClassName: "text-sky-700",
          iconWrapperClassName: "bg-sky-100",
          cardClassName: "border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-background",
          labelClassName: "border border-sky-500/30 bg-sky-500/10 text-sky-700",
        }
      case "error_not_registered":
      case "error_not_base45":
      case "error_not_compressed":
      case "error_random_qr":
        return {
          label: "Unrecognized",
          title: "ID could not be verified",
          subtitle: "The QR code does not match a supported resident identity record.",
          icon: AlertTriangle,
          iconClassName: "text-orange-700",
          iconWrapperClassName: "bg-orange-100",
          cardClassName: "border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background",
          labelClassName: "border border-orange-500/30 bg-orange-500/10 text-orange-700",
        }
      case "error_tampered":
      case "error_response_is_not_declared_json":
      case "error_other":
      default:
        return {
          label: "Rejected",
          title: "Verification failed",
          subtitle: "The QR code appears invalid, tampered, or unreadable.",
          icon: XCircle,
          iconClassName: "text-rose-700",
          iconWrapperClassName: "bg-rose-100",
          cardClassName: "border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-background",
          labelClassName: "border border-rose-500/30 bg-rose-500/10 text-rose-700",
        }
    }
  })()

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 sm:px-6 flex flex-col items-center space-y-12">
      <section className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Verify a Resident&apos;s Identity
        </h1>
        <p className="text-muted-foreground">
          Scan an LGU ID or National ID QR code to verify a resident.
        </p>
        <Button type="button" onClick={() => setIsDialogOpen(true)}>
          Start Scanning
        </Button>
        {import.meta.env.DEV ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setVerificationData(getMockVerificationResult("fixed-success"))}
          >
            Load Mock Success
          </Button>
        ) : null}
        <VerificationDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onVerificationResult={setVerificationData}
          onVerifyingChange={setIsVerifying}
        />
      </section>
      <section className="flex w-full max-w-2xl flex-col gap-4">
        <Card className={`w-full border shadow-sm ${statusCardData.cardClassName}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 rounded-full p-2 ${statusCardData.iconWrapperClassName}`}>
                <statusCardData.icon className={`size-5 ${statusCardData.iconClassName}`} />
              </div>

              <div className="space-y-1">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCardData.labelClassName}`}>
                  {statusCardData.label}
                </span>
                <CardTitle className="text-lg font-semibold tracking-tight">
                  {statusCardData.title}
                </CardTitle>
                <CardDescription>
                  {statusCardData.subtitle}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          {verificationData.message ? (
            <CardContent>
              <p className="rounded-lg border border-foreground/10 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                {verificationData.message}
              </p>
            </CardContent>
          ) : null}
        </Card>
        {
        (verificationData.result && verificationData.idDetails) ? 
        ( <ResidentProfileCard result={verificationData.result} profile={verificationData.idDetails} />): 
        null
        // TODO Render an Empty Resident Profile Card
        }
      </section>
    </main>
  )
}