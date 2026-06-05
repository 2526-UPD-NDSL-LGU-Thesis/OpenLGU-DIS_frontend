import { Link, createFileRoute } from "@tanstack/react-router"

import { Button } from "@openlguid/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"

import { IssuanceSuccessPage } from "#/features/id-management/issuance/issuance-success-page"
import { getIssuanceSuccessData } from "#/features/id-management/issuance/issuance-success-store"

export const Route = createFileRoute('/_authenticated/id-management/issuance-success')({
  component: IssuanceSuccessRouteComponent,
})

export function IssuanceSuccessRouteComponent() {
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
      <IssuanceSuccessPage data={success} />
    </div>
  )
}
