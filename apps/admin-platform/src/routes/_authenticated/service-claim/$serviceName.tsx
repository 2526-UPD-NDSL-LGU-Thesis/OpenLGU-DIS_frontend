/* Service-specific claim route with claim list and QR-based claim creation. */

import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@openlguid/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"
import {
  VerificationDialog,
} from "@openlguid/ui/features/verification/components/VerificationDialog"
import type {
  QRVerifyReturn,
} from "@openlguid/ui/features/verification/api/verificationService"

import {
  createClaim,
  getClaims,
} from "#/features/service-claim/serviceClaimAPI"
import type { ClaimItem } from "#/features/service-claim/types/serviceClaim"

export const Route = createFileRoute("/_authenticated/service-claim/$serviceName")({
  component: RouteComponent,
})

function RouteComponent() {
  const { serviceName } = Route.useParams()

  const [claims, setClaims] = useState<ClaimItem[]>([])
  const [isLoadingClaims, setIsLoadingClaims] = useState(true)
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const loadClaims = async () => {
    setIsLoadingClaims(true)
    setMessage(null)

    try {
      const response = await getClaims(serviceName)
      setClaims(response)
    } catch {
      setMessage("Unable to load claims for this service.")
    } finally {
      setIsLoadingClaims(false)
    }
  }

  useEffect(() => {
    void loadClaims()
  }, [serviceName])

  const handleVerificationResult = (result: QRVerifyReturn) => {
    if (result.result !== "success") {
      setMessage(result.message ?? "Claim aborted because QR verification failed.")
    }
  }

  const handleScanComplete = async (payload: {
    rawQRValue: string
    verificationResult: QRVerifyReturn
  }) => {
    if (payload.verificationResult.result !== "success") {
      return
    }

    try {
      await createClaim(serviceName, payload.rawQRValue)
      await loadClaims()
      setMessage("Claim created successfully.")
    } catch {
      setMessage("Failed to create claim for this service.")
    }
  }

  return (
    <main className="space-y-6 px-4">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Service Name</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{serviceName}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Claims</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{claims.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Claim Trends</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">Graph placeholder</CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Claims</h2>
          <Button type="button" onClick={() => setIsClaimDialogOpen(true)}>
            Claim LGU Service
          </Button>
        </div>

        {isVerifying ? (
          <p className="text-sm text-muted-foreground">Verifying ID and preparing claim...</p>
        ) : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        <Card>
          <CardContent className="overflow-x-auto pt-6">
            {isLoadingClaims ? (
              <p className="text-sm text-muted-foreground">Loading claims...</p>
            ) : claims.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No claims yet for this service.
              </p>
            ) : (
              <table className="w-full min-w-170 text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3">Claimed By</th>
                    <th className="pb-3">Service</th>
                    <th className="pb-3">Admin User</th>
                    <th className="pb-3">Claimed At</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim, index) => (
                    <tr key={`${claim.claimed_by}-${claim.claimed_at}-${index}`} className="border-b last:border-b-0">
                      <td className="py-3 pr-4">{claim.claimed_by}</td>
                      <td className="py-3 pr-4">{claim.service}</td>
                      <td className="py-3 pr-4">{claim.user}</td>
                      <td className="py-3 pr-4">{new Date(claim.claimed_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>

      <VerificationDialog
        open={isClaimDialogOpen}
        onOpenChange={setIsClaimDialogOpen}
        onVerificationResult={handleVerificationResult}
        onScanComplete={handleScanComplete}
        onVerifyingChange={setIsVerifying}
      />
    </main>
  )
}
