/* Service claim dashboard route with service creation and service listing. */

import { useEffect, useMemo, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"

import { Button } from "@openlguid/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@openlguid/ui/components/dialog"
import { Input } from "@openlguid/ui/components/input"

import {
  createService,
  getServices,
} from "#/api/serviceClaimAPI"
import type {
  ClaimType,
  CreateServicePayload,
  ServiceItem,
  StocksType,
} from "#/features/service-claim/types/serviceClaim"

export const Route = createFileRoute("/_authenticated/service-claim/")({
  component: RouteComponent,
})

const defaultFormState = {
  name: "",
  verbose_name: "",
  description: "",
  max_claims_per_user: 1,
  claim_type: "onetime" as ClaimType,
  refresh_interval: "",
  stocks_type: "unlimited" as StocksType,
  stocks: 1,
  active: true,
  recepient_sectors: "",
  allowed_groups: "",
}

function RouteComponent() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState(defaultFormState)

  const totalServices = services.length
  const activeServices = useMemo(
    () => services.filter((service) => service.active).length,
    [services]
  )

  const loadServices = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await getServices()
      setServices(response)
    } catch {
      setErrorMessage("Unable to load services right now.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadServices()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload: CreateServicePayload = {
      name: formState.name.trim(),
      verbose_name: formState.verbose_name.trim(),
      description: formState.description.trim(),
      max_claims_per_user: Number(formState.max_claims_per_user),
      claim_type: formState.claim_type,
      refresh_interval: formState.refresh_interval.trim() || null,
      stocks_type: formState.stocks_type,
      stocks: Number(formState.stocks),
      active: formState.active,
      recepient_sectors: splitCommaSeparatedValues(formState.recepient_sectors),
      allowed_groups: splitCommaSeparatedValues(formState.allowed_groups).map((groupId) => Number(groupId)),
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await createService(payload)
      setIsCreateDialogOpen(false)
      setFormState(defaultFormState)
      await loadServices()
    } catch {
      setErrorMessage("Failed to create service.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="space-y-6 px-4">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Services</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{totalServices}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Services</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{activeServices}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Claim Metrics</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">Graph placeholder</CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">LGU Services</h2>
          <Button type="button" onClick={() => setIsCreateDialogOpen(true)}>
            Create New LGU Service
          </Button>
        </div>

        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

        <Card>
          <CardContent className="overflow-x-auto pt-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading services...</p>
            ) : services.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services yet. Create your first one.</p>
            ) : (
              <table className="w-full min-w-175 text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Verbose Name</th>
                    <th className="pb-3">Claim Type</th>
                    <th className="pb-3">Stocks</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.name} className="border-b last:border-b-0 hover:bg-muted/50">
                      <td className="py-3 pr-4">
                        <Link
                          className="font-medium text-primary hover:underline"
                          to="/service-claim/$serviceName"
                          params={ { serviceName: service.name } }
                        >
                          {service.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">{service.verbose_name}</td>
                      <td className="py-3 pr-4">{service.claim_type}</td>
                      <td className="py-3 pr-4">
                        {service.stocks_type === "unlimited" ? "Unlimited" : service.stocks}
                      </td>
                      <td className="py-3 pr-4">{service.active ? "Active" : "Inactive"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New LGU Service</DialogTitle>
            <DialogDescription>
              Configure service metadata and claim rules.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span>Name</span>
                <Input
                  required
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, name: event.target.value }))
                  }
                />
              </label>

              <label className="space-y-1 text-sm">
                <span>Verbose Name</span>
                <Input
                  required
                  value={formState.verbose_name}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, verbose_name: event.target.value }))
                  }
                />
              </label>

              <label className="space-y-1 text-sm md:col-span-2">
                <span>Description</span>
                <textarea
                  className="min-h-20 w-full rounded-md border bg-background px-3 py-2"
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, description: event.target.value }))
                  }
                />
              </label>

              <label className="space-y-1 text-sm">
                <span>Max Claims Per User</span>
                <Input
                  required
                  min={1}
                  type="number"
                  value={formState.max_claims_per_user}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      max_claims_per_user: Number(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="space-y-1 text-sm">
                <span>Stocks</span>
                <Input
                  required
                  min={0}
                  type="number"
                  value={formState.stocks}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      stocks: Number(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="space-y-1 text-sm">
                <span>Claim Type</span>
                <select
                  className="h-9 w-full rounded-md border bg-background px-3"
                  value={formState.claim_type}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      claim_type: event.target.value as ClaimType,
                    }))
                  }
                >
                  <option value="onetime">onetime</option>
                  <option value="repeatable">repeatable</option>
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span>Stocks Type</span>
                <select
                  className="h-9 w-full rounded-md border bg-background px-3"
                  value={formState.stocks_type}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      stocks_type: event.target.value as StocksType,
                    }))
                  }
                >
                  <option value="unlimited">unlimited</option>
                  <option value="limited">limited</option>
                </select>
              </label>

              <label className="space-y-1 text-sm md:col-span-2">
                <span>Refresh Interval (optional)</span>
                <Input
                  placeholder="ex: monthly"
                  value={formState.refresh_interval}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      refresh_interval: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="space-y-1 text-sm md:col-span-2">
                <span>Recipient Sectors (comma-separated)</span>
                <Input
                  placeholder="4PS, RESIDENT, SENIOR"
                  value={formState.recepient_sectors}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      recepient_sectors: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="space-y-1 text-sm md:col-span-2">
                <span>Allowed Groups (comma-separated group ids)</span>
                <Input
                  placeholder="1, 2"
                  value={formState.allowed_groups}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      allowed_groups: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  checked={formState.active}
                  type="checkbox"
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      active: event.target.checked,
                    }))
                  }
                />
                Active
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating..." : "Create Service"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function splitCommaSeparatedValues(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}
