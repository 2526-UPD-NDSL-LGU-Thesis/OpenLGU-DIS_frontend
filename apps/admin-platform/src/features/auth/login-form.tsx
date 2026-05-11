import { cn } from "@openlguid/ui/lib/utils"
import { Button } from "@openlguid/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@openlguid/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@openlguid/ui/components/field"
import { Input } from "@openlguid/ui/components/input"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"

import useAuthStore from "#/features/auth/auth"

export function LoginForm({
  className,
  redirectTo,
  ...props
}: React.ComponentProps<"div"> & {
  redirectTo?: string
}) {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const { login } = useAuthStore()

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const result = await login({
          username: value.username.trim(),
          password: value.password,
        })

        if (result.ok) {
          const target =
            typeof redirectTo === "string" &&
            redirectTo.startsWith("/") &&
            !redirectTo.startsWith("//")
              ? redirectTo
              : "/"

          await navigate({ to: target })
          return
        }

        setError(result.error.message)
      } catch {
        setError("An unexpected error occurred. Please try again.")
      }
    },
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your LGU username
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name="username"
                validators={{
                  onSubmit: ({ value }) =>
                    value.trim().length === 0 ? "Username is required." : undefined,
                }}
              >
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="super"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      disabled={form.state.isSubmitting}
                    />
                    {field.state.meta.errors[0] ? (
                      <FieldDescription className="text-destructive">
                        {field.state.meta.errors[0]}
                      </FieldDescription>
                    ) : null}
                  </Field>
                )}
              </form.Field>
              <form.Field
                name="password"
                validators={{
                  onSubmit: ({ value }) =>
                    value.trim().length === 0 ? "Password is required." : undefined,
                }}
              >
                {(field) => (
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    </div>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      disabled={form.state.isSubmitting}
                    />
                    {field.state.meta.errors[0] ? (
                      <FieldDescription className="text-destructive">
                        {field.state.meta.errors[0]}
                      </FieldDescription>
                    ) : null}
                  </Field>
                )}
              </form.Field>
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Field>
                <Button type="submit" disabled={form.state.isSubmitting}>
                  {form.state.isSubmitting ? (
                    <>
                      <Loader2Icon
                        className="size-4 animate-spin"
                        data-testid="login-spinner"
                        aria-hidden="true"
                      />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
