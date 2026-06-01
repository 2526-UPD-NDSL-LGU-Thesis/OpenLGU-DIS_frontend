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


  // TODO fix render the other side https://ui.shadcn.com/blocks/login
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your OpenLGU ID account
                </p>
              </div>
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
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
