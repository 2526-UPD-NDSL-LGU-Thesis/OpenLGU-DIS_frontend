import { createFileRoute, linkOptions, redirect } from '@tanstack/react-router'
import { canAccessIdManagement } from "#/features/auth/id-management-access-policy"

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
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "ID Management"!</div>
}
