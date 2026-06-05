import { Link, createFileRoute } from "@tanstack/react-router"

import { Button } from "@openlguid/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"

import { IdPreviewSuccessPage } from "#/features/id-management/id-preview/IdPreviewSuccessPage"
import { getIdPreviewData } from "#/features/id-management/id-preview/id-preview-store"

export const Route = createFileRoute('/_authenticated/id-management/verify-success')({
  component: VerifySuccessRouteComponent,
})

export function VerifySuccessRouteComponent() {
  const previewData = getIdPreviewData()

  if (!previewData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No ID preview available</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Return to the dashboard to capture and verify a resident ID.
          </p>
          <Button variant="outline" asChild>
            <Link to="/id-management">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6">
      <IdPreviewSuccessPage data={previewData} title="Verification complete" />
    </div>
  )
}
