import { Link, createFileRoute } from "@tanstack/react-router"

import { Button } from "@openlguid/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"
import { PhysicalLGUIDPreview } from "@openlguid/physical-id-template/preview"

import { getIssuanceSuccessData } from "#/features/id-management/issuance/issuance-success-store"

export const Route = createFileRoute('/_authenticated/id-management/issuance-success')({
  component: IssuanceSuccessRouteComponent,
})

function IssuanceSuccessRouteComponent() {
  const success = getIssuanceSuccessData()

  if (!success) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>No issuance result available</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/id-management">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Issuance complete</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Assigned UIN: <span className="font-medium text-foreground">{success.uin}</span>
          </p>
          {success.pcn ? (
            <p className="mt-1 text-sm text-muted-foreground">
              PCN: <span className="font-medium text-foreground">{success.pcn}</span>
            </p>
          ) : null}
          <div className="mt-1 text-sm text-muted-foreground">
            QR: <span className="font-medium text-foreground">{success.qr}</span>
          </div>
          <div className="mt-4 rounded-2xl border border-border/70 bg-muted/40 p-4">
            <PhysicalLGUIDPreview data={success.preview} className="min-h-[16rem]" />
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link to="/id-management">Back to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
