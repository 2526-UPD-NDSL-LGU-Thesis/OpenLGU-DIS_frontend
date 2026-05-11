import { createFileRoute, linkOptions, redirect } from '@tanstack/react-router'
import { canAccessIdRegistration } from "#/features/auth/id-registration-access-policy"

const insufficientPermissionsRedirect = linkOptions({
  to: "/",
  search: {
    notice: "insufficient-permissions",
  },
})

export const Route = createFileRoute('/_authenticated/id-registration')({
  beforeLoad: ({ context }) => {
    const authState = context.auth.sessionService.getAuthState()
    if (!canAccessIdRegistration(authState)) {
      throw redirect(insufficientPermissionsRedirect)
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/id-registration"!</div>
}
