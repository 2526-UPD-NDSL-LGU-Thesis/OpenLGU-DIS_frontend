import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

import { LoginForm } from "#/features/auth/login-form"

export const Route = createFileRoute("/_public/login")({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad: async ({ context, search }) => {
    // If a refresh session exists, we can silently recover and skip the login page.
    const access = await context.auth.sessionService.ensureAuthenticated({
      redirectTo: search.redirect ?? "/",
    })

    if (access.ok) {
      throw redirect({
        to: search.redirect ?? "/",
      })
    }
  },
  component: Login,
})

function Login() {
  const search = Route.useSearch()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm redirectTo={search.redirect}/>
      </div>
    </div>
  )
}
