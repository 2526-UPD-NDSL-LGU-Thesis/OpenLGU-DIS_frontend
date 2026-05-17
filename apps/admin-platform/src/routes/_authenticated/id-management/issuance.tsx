import { createFileRoute } from "@tanstack/react-router"
import IssuanceWizard from "#/features/id-management/issuance/IssuanceWizard"

export const Route = createFileRoute('/_authenticated/id-management/issuance')({
  component: IssuanceRouteComponent,
})

function IssuanceRouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">ID Issuance</h1>
      <IssuanceWizard />
    </div>
  )
}
