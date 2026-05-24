import { createFileRoute, useRouter } from "@tanstack/react-router"
import IssuanceWizard from "#/features/id-management/issuance/IssuanceWizard"

export const Route = createFileRoute('/_authenticated/id-management/issuance')({
  component: IssuanceRouteComponent,
})

function IssuanceRouteComponent() {
  const router = useRouter()
  const auth = (router.options.context as { auth?: { authenticatedApiClient?: { request: (path: string, init?: RequestInit) => Promise<Response> } } } | undefined)?.auth

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">ID Issuance</h1>
      <IssuanceWizard apiClient={auth?.authenticatedApiClient} />
    </div>
  )
}
