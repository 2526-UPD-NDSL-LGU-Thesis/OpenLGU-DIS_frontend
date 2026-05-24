import { useCallback, useEffect, useMemo, useState } from "react"
import { createFileRoute, linkOptions, redirect, useRouter } from "@tanstack/react-router"

import { Button } from "@openlguid/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@openlguid/ui/components/card"
import type { IdentifierCaptureRequest } from "@openlguid/ui/features/verification/components/IdentifierCaptureDialog"
import { IdentifierCaptureDialog } from "@openlguid/ui/features/verification/components/IdentifierCaptureDialog"

import { DataTable } from "#/features/service-claim/components/data-table"
import { canAccessSectorManagement } from "#/features/auth/sector-access-policy"
import {
  enlistResidentToSector,
  getSectors,
} from "#/features/sector-management/sectorAPI"
import type { SectorItem } from "#/features/sector-management/types"
import { submitIdentifierCapture } from "#/features/identifier-capture/identifier-capture-submit"

const insufficientPermissionsRedirect = linkOptions({
  to: "/",
  search: {
    notice: "insufficient-permissions",
  },
})

export const Route = createFileRoute("/_authenticated/sector-management/$sectorID")({
  beforeLoad: ({ context }) => {
    const authState = context.auth.sessionService.getAuthState()
    if (!canAccessSectorManagement(authState)) {
      throw redirect(insufficientPermissionsRedirect)
    }
  },
  component: SectorDetailRoute,
})

function SectorDetailRoute() {
  const router = useRouter()
  const auth = router.options.context.auth
  const apiClient = auth.authenticatedApiClient
  const { sectorID } = Route.useParams()

  const [sectors, setSectors] = useState<SectorItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false)

  const loadSectors = useCallback(async () => {
    setIsLoading(true)
    try {
      setSectors(await getSectors(apiClient))
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to load sector.")
    } finally {
      setIsLoading(false)
    }
  }, [apiClient])

  useEffect(() => {
    void loadSectors()
  }, [loadSectors])

  const sector = useMemo(
    () => sectors.find((candidate) => candidate.id === sectorID) ?? null,
    [sectorID, sectors]
  )

  const handleCaptureSubmit = useCallback(
    async (request: IdentifierCaptureRequest) => {
      try {
        const response = await submitIdentifierCapture(request, {
          qr: async (rawQRValue) => enlistResidentToSector(apiClient, [sectorID], rawQRValue),
          manual: async () => {
            setStatusMessage("Manual identifier capture is not implemented yet.")
            throw new Error("Manual identifier capture is not implemented yet.")
          },
        })
        setStatusMessage(response.message ?? "Resident enlisted in this sector.")
        await loadSectors()
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Failed to enlist resident.")
        throw error
      }
    },
    [apiClient, loadSectors, sectorID]
  )

  return (
    <main className="space-y-6 px-4">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sector ID</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{sectorID}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sector Name</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {sector?.name ?? "Loading..."}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resident Count</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {sector?.resident_count ?? 0}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{sector?.name ?? "Sector details"}</h1>
            <p className="text-sm text-muted-foreground">
              Scan a resident QR code to enlist them in this sector.
            </p>
          </div>
          <Button type="button" onClick={() => setIsVerificationDialogOpen(true)}>
            Enlist Resident
          </Button>
        </div>

        {statusMessage ? (
          <p className="text-sm text-muted-foreground">{statusMessage}</p>
        ) : null}

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading sector details...</p>
            ) : sector ? (
              <DataTable
                columns={[
                  { accessorKey: "id", header: "Sector ID" },
                  { accessorKey: "name", header: "Name" },
                  {
                    accessorKey: "description",
                    header: "Description",
                    cell: ({ row }) => row.original.description ?? "—",
                  },
                  {
                    accessorKey: "created_at",
                    header: "Created At",
                    cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
                  },
                  { accessorKey: "resident_count", header: "Resident Count" },
                ]}
                data={[sector]}
                emptyMessage="Sector details unavailable."
              />
            ) : (
              <p className="text-sm text-muted-foreground">Sector not found.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <IdentifierCaptureDialog
        open={isVerificationDialogOpen}
        onOpenChange={setIsVerificationDialogOpen}
        onSubmit={handleCaptureSubmit}
      />
    </main>
  )
}
