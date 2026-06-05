import { createFileRoute, linkOptions, redirect, useRouter } from '@tanstack/react-router'
import { useState } from "react"
import { canAccessIdManagement } from "#/features/auth/id-management-access-policy"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"
import { buttonVariants } from "@openlguid/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@openlguid/ui/components/dialog"
import { IdentifierCaptureDialog } from "@openlguid/ui/features/verification/components/IdentifierCaptureDialog"
import type { IdentifierCaptureRequest } from "@openlguid/ui/features/verification/components/IdentifierCaptureDialog"
import { verifyQR } from "@openlguid/ui/features/verification/api/verificationService"

import { submitIdentifierCapture } from "#/features/identifier-capture/identifier-capture-submit"
import { buildPhysicalIdTemplateData } from "#/features/id-management/id-preview/id-preview-mapper"
import { setIdPreviewData } from "#/features/id-management/id-preview/id-preview-store"
import { verifyNationalId } from "#/features/id-management/issuance/nationalIdVerification"
import type { NationalIdVerificationDetails } from "#/features/id-management/issuance/nationalIdVerification"
import { mapNationalIdToIssuancePrefill } from "#/features/id-management/issuance/issuance-prefill-mapper"
import { setIssuancePrefill } from "#/features/id-management/issuance/issuance-prefill-store"

const insufficientPermissionsRedirect = linkOptions({
  to: "/",
  search: {
    notice: "insufficient-permissions",
  },
})

export const Route = createFileRoute('/_authenticated/id-management/')({
  beforeLoad: ({ context }) => {
    const authState = context.auth.sessionService.getAuthState()
    if (!canAccessIdManagement(authState)) {
      throw redirect(insufficientPermissionsRedirect)
    }
  },
  component: IdManagementDashboard,
})

export function IdManagementDashboard() {
  const router = useRouter()
  const auth = (router.options.context as { auth?: { authenticatedApiClient?: { request: (path: string, init?: RequestInit) => Promise<Response> } } } | undefined)?.auth
  const [isCaptureOpen, setIsCaptureOpen] = useState(false)
  const [isIssuanceChoiceOpen, setIsIssuanceChoiceOpen] = useState(false)
  const [isNationalIdCaptureOpen, setIsNationalIdCaptureOpen] = useState(false)
  const [nationalIdDetails, setNationalIdDetails] = useState<NationalIdVerificationDetails | null>(null)


  const handleCaptureSubmit = async (request: IdentifierCaptureRequest) => {
    if (request.kind !== "qr") {
      throw new Error("Manual identifier capture is not supported for ID preview yet.")
    }

    const result = await verifyQR(request.rawQRValue)

    if (result.result !== "success" || !result.idDetails) {
      throw new Error(result.message ?? "Verification failed. Please try again.")
    }

    const templateData = await buildPhysicalIdTemplateData(result.idDetails, request.rawQRValue)

    setIdPreviewData(templateData)
    await router.navigate({ to: "/id-management/verify-success" })
  }

  const handleNationalIdCapture = async (request: IdentifierCaptureRequest) => {
    const result = await submitIdentifierCapture(request, {
      qr: async (rawQRValue) => verifyNationalId(rawQRValue, auth?.authenticatedApiClient),
      manual: async () => {
        throw new Error("Manual identifier capture is not supported for National ID intake.")
      },
    })

    setNationalIdDetails(result)
  }

  const handleContinueToIssuance = async (prefill?: NationalIdVerificationDetails) => {
    setIsIssuanceChoiceOpen(false)
    setIsNationalIdCaptureOpen(false)
    setNationalIdDetails(null)
    if (prefill) {
      setIssuancePrefill(mapNationalIdToIssuancePrefill(prefill))
    }
    await router.navigate({ to: "/id-management/issuance" })
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">ID Management</h1>

      {/* <div className="mt-4 grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total issued (this month)</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">Placeholder</CardContent>
        </Card>
      </div> */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={buttonVariants({})}
            onClick={() => setIsCaptureOpen(true)}
          >
            Verify/View/Print ID
          </button>
          <button
            type="button"
            className={buttonVariants({ variant: "outline" })}
            onClick={() => setIsIssuanceChoiceOpen(true)}
          >
            Start Issuance
          </button>
        </div>
      </div>
      <IdentifierCaptureDialog
        open={isCaptureOpen}
        onOpenChange={setIsCaptureOpen}
        onSubmit={handleCaptureSubmit}
      />
      <Dialog open={isIssuanceChoiceOpen} onOpenChange={setIsIssuanceChoiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start issuance</DialogTitle>
            <DialogDescription>
              Choose how you want to start the issuance flow.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className={buttonVariants({})}
              onClick={() => {
                setIsIssuanceChoiceOpen(false)
                setIsNationalIdCaptureOpen(true)
              }}
            >
              Scan National ID
            </button>
            {/* <button
              type="button"
              className={buttonVariants({ variant: "outline" })}
              onClick={() => handleContinueToIssuance()}
            >
              Continue without National ID
            </button> */}
          </div>
        </DialogContent>
      </Dialog>
      <IdentifierCaptureDialog
        open={isNationalIdCaptureOpen}
        onOpenChange={setIsNationalIdCaptureOpen}
        onSubmit={handleNationalIdCapture}
      />
      <Dialog open={Boolean(nationalIdDetails)} onOpenChange={() => setNationalIdDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>National ID details</DialogTitle>
            <DialogDescription>
              Review the captured details before continuing.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div>Name: {[nationalIdDetails?.first_name, nationalIdDetails?.last_name].filter(Boolean).join(" ") || "—"}</div>
            <div>PCN: {nationalIdDetails?.pcn ?? "—"}</div>
            <div>Birthdate: {nationalIdDetails?.birthdate ?? "—"}</div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className={buttonVariants({})}
              onClick={() => handleContinueToIssuance(nationalIdDetails ?? undefined)}
            >
              Continue to issuance form
            </button>
            <button
              type="button"
              className={buttonVariants({ variant: "outline" })}
              onClick={() => handleContinueToIssuance()}
            >
              Continue manually
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
