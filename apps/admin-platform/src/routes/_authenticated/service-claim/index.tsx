/* Service claim dashboard route with service creation and service listing. */

import { useEffect, useMemo, useState } from "react"
import {
  createFileRoute,
  Link,
  linkOptions,
  redirect,
  useRouter,
} from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@openlguid/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@openlguid/ui/components/dialog"
import { Field, FieldLabel } from "@openlguid/ui/components/field"
import { Input } from "@openlguid/ui/components/input"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@openlguid/ui/components/combobox"

import {
  createService,
  getClaimGroups,
  getServices,
} from "#/features/service-claim/serviceClaimAPI"
import {
  ClaimGroup,
  type ServiceItem,
  type serviceItemSchema,
} from "#/features/service-claim/types/serviceSchema"
import { canAccessServiceClaim } from "#/features/auth/service-claim-access-policy"
import { DataTable } from "#/features/service-claim/components/data-table"
import {
  getSectors
} from "#/features/sector-management/sectorAPI"
import type {
  SectorItem,
} from "#/features/sector-management/types"


const insufficientPermissionsRedirect = linkOptions({
  to: "/",
  search: {
    notice: "insufficient-permissions",
  },
})

export const Route = createFileRoute("/_authenticated/service-claim/")({
  beforeLoad: ({ context }) => {
    const authState = context.auth.sessionService.getAuthState()
    if (!canAccessServiceClaim(authState)) {
      throw redirect(insufficientPermissionsRedirect)
    }
  },
  component: RouteComponent,
})

const defaultFormState: ServiceItem = {
  id: "",
  name: "",
  description: null,
  max_claims_per_user: 1,
  claim_type: "onetime",
  refresh_interval: null,
  stocks_type: "unlimited",
  stocks: 1,
  active: true,
  recipient_sectors: [],
  allowed_groups: [],
}


function RouteComponent() {
  const [sectors, setSectors] = useState<SectorItem[]>([]) // TODO MAKE THIS BETTER SOMEHOW?
  const [services, setServices] = useState<ServiceItem[]>([])
  const [claimGroups, setClaimGroups] = useState<ClaimGroup[]>([]);
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
  const serviceColumns = useMemo<ColumnDef<ServiceItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const service = row.original
          return (
            <Link
              className="font-medium text-primary hover:underline"
              to="/service-claim/$serviceID"
              params={{ serviceID: service.id || service.name }}
              search={{ serviceName: service.name }}
            >
              {service.name}
            </Link>
          )
        },
      },
      {
        accessorKey: "description",
        header: "Description"
      },
      {
        id: "recipient_sectors",
        header: "Recipient Sectors",
        cell: ({ row }) => (row.original.recipient_sectors.map(sector =>
          sector.name + ", "
        )),
      },
      {
        accessorKey: "stocks",
        header: "Stocks",
      },
      {
        id: "active",
        header: "Status",
        cell: ({ row }) => (row.original.active ? "Active" : "Inactive"),
      },
    ],
    []
  )

  const router = useRouter()
  const apiClient = router.options.context.auth.authenticatedApiClient

  const loadServices = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const serviceResponse = await getServices(apiClient);
      const sectorResponse = await getSectors(apiClient); // TODO THIS SHOULD BE BETTER SOMEHOW MAYBE
      const claimGroupResponse = await getClaimGroups(apiClient);
      setServices(serviceResponse);
      setSectors(sectorResponse);
      setClaimGroups(claimGroupResponse);
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

    const payload = { // TODO issue is that recipient sectors and allowed_groups have different shapes between GET response and POST request bodies
      name: formState.name.trim(),
      description: formState.description.trim(),
      max_claims_per_user: Number(formState.max_claims_per_user),
      claim_type: formState.claim_type,
      refresh_interval: formState.refresh_interval.trim() || null,
      stocks_type: formState.stocks_type,
      stocks: Number(formState.stocks),
      active: formState.active,
      recipient_sectors: formState.recipient_sectors.map(sector => sector.id),
      allowed_groups: formState.allowed_groups.map(group => group.id)
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await createService(apiClient, payload)
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
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading services...</p>
            ) : services.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services yet. Create your first one.</p>
            ) : (
              <DataTable
                columns={serviceColumns}
                data={services}
                emptyMessage="No services yet. Create your first one."
              />
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
                      claim_type: event.target.value,
                    }))
                  }
                >
                  <option value="onetime">onetime</option>
                  <option value="periodic">periodic</option>
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
                      stocks_type: event.target.value,
                    }))
                  }
                >
                  <option value="unlimited">unlimited</option>
                  <option value="limited">limited</option>
                </select>
              </label>

              <label className="space-y-1 text-sm md:col-span-2">
                <span>Refresh Interval (optional)</span>
                <select
                  className="h-9 w-full rounded-md border bg-background px-3"
                  value={formState.refresh_interval}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      refresh_interval: event.target.value,
                    }))
                  }
                >
                  <option value="null">none</option>
                  <option value="daily">daily</option> // TODO I SHOULD PULL THIS FROM SCHEMA
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                  <option value="quarterly">quarterly</option>
                  <option value="yearly">yearly</option>
                </select>
              </label>

              <label className="space-y-1 text-sm md:col-span-2">
                <span>Recipient Sectors</span>
                <Combobox
                  items={sectors}
                  multiple
                  value={formState.recipient_sectors}
                  onValueChange={(selected_sectors) =>
                    setFormState((previous) => ({
                      ...previous,
                      recipient_sectors: selected_sectors,
                    }))}
                >
                  <ComboboxChips>
                    <ComboboxValue>
                      {formState.recipient_sectors.map((sector) => (
                        <ComboboxChip key={sector.id}>
                          {sector.name}
                        </ComboboxChip>
                      ))}
                    </ComboboxValue>
                    <ComboboxChipsInput placeholder="Choose Sectors" />
                  </ComboboxChips>
                  <ComboboxContent>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(sector) => (
                        <ComboboxItem key={sector.id} value={sector}>
                          {sector.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </label>

              <label className="space-y-1 text-sm md:col-span-2">
                <span>Allowed Claim Groups</span>
                                <Combobox
                  items={claimGroups}
                  multiple
                  value={formState.allowed_groups}
                  onValueChange={(selected_claim_groups) =>
                    setFormState((previous) => ({
                      ...previous,
                      allowed_groups: selected_claim_groups,
                    }))}
                >
                  <ComboboxChips>
                    <ComboboxValue>
                      {formState.allowed_groups.map((claimGroup) => (
                        <ComboboxChip key={claimGroup.id}>
                          {claimGroup.name}
                        </ComboboxChip>
                      ))}
                    </ComboboxValue>
                    <ComboboxChipsInput placeholder="Choose Sectors" />
                  </ComboboxChips>
                  <ComboboxContent>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(claimGroup) => (
                        <ComboboxItem key={claimGroup.id} value={claimGroup}>
                          {claimGroup.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
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
