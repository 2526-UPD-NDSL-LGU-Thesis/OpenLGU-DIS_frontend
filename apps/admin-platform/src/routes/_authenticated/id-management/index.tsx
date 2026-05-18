import { Link, createFileRoute, linkOptions, redirect, useRouter } from '@tanstack/react-router'
import { useState } from "react"
import { canAccessIdManagement } from "#/features/auth/id-management-access-policy"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"
import { buttonVariants } from "@openlguid/ui/components/button"
import {
  IdentifierCaptureDialog,
  type IdentifierCaptureRequest,
} from "@openlguid/ui/features/verification/components/IdentifierCaptureDialog"
import { verifyQR } from "@openlguid/ui/features/verification/api/verificationService"

import { submitIdentifierCapture } from "#/features/identifier-capture/identifier-capture-submit"
import { buildPhysicalIdTemplateData } from "#/features/id-management/id-preview/id-preview-mapper"
import { setIdPreviewData } from "#/features/id-management/id-preview/id-preview-store"

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
  const [isCaptureOpen, setIsCaptureOpen] = useState(false)
  // Mocked metrics for tracer/demo purposes
  const metrics = {
    totalIssuedThisMonth: 124,
    pendingVerifications: 3,
  }

  const handleCaptureSubmit = async (request: IdentifierCaptureRequest) => {
    const result = await submitIdentifierCapture(request, {
      qr: async (rawQRValue) => verifyQR(rawQRValue),
      manual: async () => {
        throw new Error("Manual identifier capture is not supported for ID preview yet.")
      },
    })

    if (result.result !== "success" || !result.idDetails) {
      throw new Error(result.message ?? "Verification failed. Please try again.")
    }

    setIdPreviewData(buildPhysicalIdTemplateData(result.idDetails))
    await router.navigate({ to: "/id-management/id-preview" })
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">ID Management</h1>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total issued (this month)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metrics.totalIssuedThisMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metrics.pendingVerifications}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={buttonVariants({})}
            onClick={() => setIsCaptureOpen(true)}
          >
            Verify/View/Print ID
          </button>
          <Link to="/id-management/issuance" className={buttonVariants({ variant: "outline" })}>
            Start Issuance
          </Link>
        </div>
      </div>
      <IdentifierCaptureDialog
        open={isCaptureOpen}
        onOpenChange={setIsCaptureOpen}
        onSubmit={handleCaptureSubmit}
      />
    </div>
  )
}
