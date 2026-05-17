import { createFileRoute, linkOptions, redirect, useNavigate } from '@tanstack/react-router'
import { canAccessIdManagement } from "#/features/auth/id-management-access-policy"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"
import { Button } from "@openlguid/ui/components/button"

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
  const navigate = useNavigate()

  // Mocked metrics for tracer/demo purposes
  const metrics = {
    totalIssuedThisMonth: 124,
    pendingVerifications: 3,
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
        <Button onClick={() => navigate({ to: "/id-management/issuance" })}>
          Start Issuance
        </Button>
        <a href="/id-management/issuance" className="sr-only" />
      </div>
    </div>
  )
}
