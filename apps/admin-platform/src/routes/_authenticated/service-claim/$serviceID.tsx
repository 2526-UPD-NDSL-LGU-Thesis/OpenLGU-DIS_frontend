/* Service-specific claim route with claim list and QR-based claim creation. */

import { useCallback, useEffect, useMemo, useState } from "react"
import { createFileRoute, linkOptions, redirect, useRouter } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@openlguid/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"
import type { IdentifierCaptureRequest } from "@openlguid/ui/features/verification/components/IdentifierCaptureDialog"
import {
  IdentifierCaptureDialog,
} from "@openlguid/ui/features/verification/components/IdentifierCaptureDialog"

import { createClaim, getClaims } from "#/features/service-claim/serviceClaimAPI"
import { createClaimSubmissionGuard } from "#/features/service-claim/claim-submission-guard"
import type { ClaimItem } from "#/features/service-claim/types/serviceSchema"
import { canAccessServiceClaim } from "#/features/auth/service-claim-access-policy"
import { DataTable } from "#/features/service-claim/components/data-table"
import { submitIdentifierCapture } from "#/features/identifier-capture/identifier-capture-submit"

import { z } from 'zod';

const insufficientPermissionsRedirect = linkOptions({
  to: "/",
  search: {
    notice: "insufficient-permissions",
  },
})

export const Route = createFileRoute("/_authenticated/service-claim/$serviceID")({
  beforeLoad: ({ context }) => {
    const authState = context.auth.sessionService.getAuthState()
    if (!canAccessServiceClaim(authState)) {
      throw redirect(insufficientPermissionsRedirect)
    }
  },
  validateSearch: z.object({ serviceName: z.string() }),
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const apiClient = router.options.context.auth.authenticatedApiClient

  const { serviceID } = Route.useParams();
  const { serviceName } = Route.useSearch();

  const [claims, setClaims] = useState<ClaimItem[]>([])
  const [isLoadingClaims, setIsLoadingClaims] = useState(true)
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const claimSubmissionGuard = useMemo(() => createClaimSubmissionGuard(), [])
  const claimColumns = useMemo<ColumnDef<ClaimItem>[]>(
    () => [
      {
        accessorKey: "user",
        header: "Claimed By (Resident ID)",
      },
      {
        accessorKey: "claimed_by",
        header: "Facilitated By (Employee)",
      },
      {
        id: "claimed_at",
        header: "Claimed At",
        cell: ({ row }) => new Date(row.original.claimed_at).toLocaleString(),
      },
    ],
    []
  )
  const hasValidServiceID = serviceID && serviceID !== "undefined"

  const loadClaims = useCallback(async () => {
    if (!hasValidServiceID) {
      setMessage("Invalid service route. Please select a valid service from the list.")
      setIsLoadingClaims(false)
      return
    }

    setIsLoadingClaims(true)
    setMessage(null)

    try {
      const response = await getClaims(apiClient, serviceID)
      setClaims(response);
    } catch {
      setMessage("Unable to load claims for this service.")
    } finally {
      setIsLoadingClaims(false)
    }
  }, [apiClient, hasValidServiceID, serviceID])

  useEffect(() => {
    void loadClaims()
  }, [loadClaims])

  const handleCaptureSubmit = useCallback(
    async (request: IdentifierCaptureRequest) => {
      if (!hasValidServiceID) {
        throw new Error("Invalid service route. Please select a valid service from the list.")
      }

      try {
        const handled = await claimSubmissionGuard.run(async () => {
          await submitIdentifierCapture(request, {
            qr: async (rawQRValue) => {
              await createClaim(apiClient, serviceID, rawQRValue)
            },
            manual: async () => {
              setMessage("Manual identifier capture is not implemented yet.")
              throw new Error("Manual identifier capture is not implemented yet.")
            },
          })
          await loadClaims()
          setMessage("Claim created successfully.") // TODO this can be improved by creating a UI instead for successes and errors. Maybe a dialog box suffices? (Instrusive though for successes unless there's an auto wipe)
        })
        if (handled === null) {
          return
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to create claim for this service.")
        throw error
      }
    },
    [apiClient, claimSubmissionGuard, hasValidServiceID, loadClaims, serviceID]
  )

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
        {/* <Card>
          <CardHeader>
            <CardTitle>Claim Trends</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">Graph placeholder</CardContent>
        </Card> */}
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
          <CardContent className="pt-6">
            {isLoadingClaims ? (
              <p className="text-sm text-muted-foreground">Loading claims...</p>
            ) : claims.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No claims yet for this service.
              </p>
            ) : (
              <DataTable
                columns={claimColumns}
                data={claims}
                emptyMessage="No claims yet for this service."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <IdentifierCaptureDialog
        open={isClaimDialogOpen}
        onOpenChange={setIsClaimDialogOpen}
        onSubmit={handleCaptureSubmit}
        onSubmittingChange={setIsVerifying}
      />
    </main>
  )
}
