import { createFileRoute, linkOptions, redirect } from '@tanstack/react-router'
import { authSessionService } from "#/features/auth/auth"
import { canAccessIdRegistration } from "#/features/auth/id-registration-access-policy"

const insufficientPermissionsRedirect = linkOptions({
  to: "/_authenticated/",
  search: {
    notice: "insufficient-permissions",
  },
})

export const Route = createFileRoute('/_authenticated/id-registration')({
  beforeLoad: () => {
    const authState = authSessionService.getAuthState()
    if (!canAccessIdRegistration(authState)) {
      throw redirect(insufficientPermissionsRedirect)
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/id-registration"!</div>
}
