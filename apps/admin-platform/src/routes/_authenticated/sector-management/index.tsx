import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Link,
  createFileRoute,
  linkOptions,
  redirect,
  useRouter,
} from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { EllipsisVerticalIcon } from "lucide-react"

import { Button } from "@openlguid/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@openlguid/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@openlguid/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@openlguid/ui/components/dropdown-menu"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@openlguid/ui/components/field"
import { Input } from "@openlguid/ui/components/input"
import { Textarea } from "@openlguid/ui/components/textarea"

import { DataTable } from "#/features/service-claim/components/data-table"
import { canAccessSectorManagement, canManageSectors } from "#/features/auth/sector-access-policy"
import {
  createSector,
  deleteSector,
  getSectors,
} from "#/features/sector-management/sectorAPI"
import type {
  CreateSectorPayload,
  SectorItem,
} from "#/features/sector-management/types"

const insufficientPermissionsRedirect = linkOptions({
  to: "/",
  search: {
    notice: "insufficient-permissions",
  },
})

export const Route = createFileRoute("/_authenticated/sector-management/")({
  beforeLoad: ({ context }) => {
    const authState = context.auth.sessionService.getAuthState()
    if (!canAccessSectorManagement(authState)) {
      throw redirect(insufficientPermissionsRedirect)
    }
  },
  component: SectorManagementDashboard,
})

interface StatusMessage {
  kind: "success" | "error"
  text: string
}

function splitCommaSeparatedValues(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function SectorUpsertDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  defaultName = "",
  defaultDescription = "",
  defaultSourceSectors = [],
  onSubmit,
}: {
  open: boolean
  onOpenChange: (nextOpen: boolean) => void
  title: string
  description: string
  submitLabel: string
  defaultName?: string
  defaultDescription?: string
  defaultSourceSectors?: string[]
  onSubmit: (payload: CreateSectorPayload) => Promise<void>
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const hasSourceSectors = defaultSourceSectors.length > 0

  const form = useForm({
    defaultValues: {
      name: defaultName,
      description: defaultDescription,
      sourceSectors: defaultSourceSectors.join(", "),
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      const result = z
        .object({
          name: z.string().trim().min(1, "Sector name is required."),
          description: z.string().optional(),
          sourceSectors: z.string().optional(),
        })
        .safeParse(value)

      if (!result.success) {
        setSubmitError(result.error.issues[0]?.message ?? "Please fix the form fields.")
        return
      }

      const name = result.data.name.trim()
      const descriptionValue = result.data.description?.trim()
      const sourceSectorIDs =
        hasSourceSectors || result.data.sourceSectors
          ? splitCommaSeparatedValues(result.data.sourceSectors ?? "")
          : []

      if (hasSourceSectors && sourceSectorIDs.length === 0) {
        setSubmitError("Provide at least one source sector.")
        return
      }

      try {
        await onSubmit({
          name,
          description: descriptionValue || undefined,
          fromSectors: sourceSectorIDs.length > 0 ? sourceSectorIDs : undefined,
        })
        onOpenChange(false)
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Unable to save sector."
        )
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              validators={{
                onSubmit: ({ value }) =>
                  value.trim().length === 0 ? "Sector name is required." : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
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

            <form.Field name="description">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    disabled={form.state.isSubmitting}
                    placeholder="Optional"
                  />
                </Field>
              )}
            </form.Field>

            {hasSourceSectors || title.includes("Create From") ? (
              <form.Field
                name="sourceSectors"
                validators={{
                  onSubmit: ({ value }) => {
                    const sourceSectorIDs = splitCommaSeparatedValues(value)
                    return sourceSectorIDs.length === 0
                      ? "Provide at least one source sector."
                      : undefined
                  },
                }}
              >
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Source sectors</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      disabled={form.state.isSubmitting}
                      placeholder="sector-a, sector-b"
                    />
                    {field.state.meta.errors[0] ? (
                      <FieldDescription className="text-destructive">
                        {field.state.meta.errors[0]}
                      </FieldDescription>
                    ) : (
                      <FieldDescription>Comma-separated sector IDs.</FieldDescription>
                    )}
                  </Field>
                )}
              </form.Field>
            ) : null}

            {submitError ? (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            ) : null}

            <Field>
              <Button type="submit" disabled={form.state.isSubmitting}>
                {form.state.isSubmitting ? "Saving..." : submitLabel}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteSectorDialog({
  open,
  onOpenChange,
  sector,
  onDelete,
}: {
  open: boolean
  onOpenChange: (nextOpen: boolean) => void
  sector: SectorItem | null
  onDelete: (sector: SectorItem) => Promise<void>
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const targetName = sector?.name ?? ""

  const form = useForm({
    defaultValues: {
      confirmation: "",
    },
    onSubmit: async ({ value }) => {
      if (!sector) {
        setSubmitError("Select a sector to delete.")
        return
      }

      setSubmitError(null)
      const result = z
        .object({
          confirmation: z
            .string()
            .trim()
            .refine((next) => next === targetName, {
              message: `Type ${targetName} to confirm.`,
            }),
        })
        .safeParse(value)

      if (!result.success) {
        setSubmitError(result.error.issues[0]?.message ?? "Confirmation is required.")
        return
      }

      try {
        await onDelete(sector)
        onOpenChange(false)
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Unable to delete sector."
        )
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete sector</DialogTitle>
          <DialogDescription>
            Type the sector name exactly to confirm permanent deletion.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="confirmation"
              validators={{
                onSubmit: ({ value }) =>
                  value.trim() === targetName
                    ? undefined
                    : `Type ${targetName} to confirm.`,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Confirmation</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    disabled={form.state.isSubmitting || !sector}
                  />
                  {field.state.meta.errors[0] ? (
                    <FieldDescription className="text-destructive">
                      {field.state.meta.errors[0]}
                    </FieldDescription>
                  ) : (
                    <FieldDescription>Type {targetName} to continue.</FieldDescription>
                  )}
                </Field>
              )}
            </form.Field>

            {submitError ? (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            ) : null}

            <Field>
              <Button type="submit" variant="destructive" disabled={form.state.isSubmitting}>
                {form.state.isSubmitting ? "Deleting..." : "Delete sector"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SectorActionsMenu({
  sector,
  canManage,
  onEnlist,
  onCreateFrom,
  onDelete,
}: {
  sector: SectorItem
  canManage: boolean
  onEnlist: (sector: SectorItem) => void
  onCreateFrom: (sector: SectorItem) => void
  onDelete: (sector: SectorItem) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${sector.name}`} />
        }
      >
        <EllipsisVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEnlist(sector)}>Enlist Resident</DropdownMenuItem>
        {canManage ? (
          <>
            <DropdownMenuItem onSelect={() => onCreateFrom(sector)}>Create From</DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(sector)}
            >
              Delete
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SectorManagementDashboard() {
  const router = useRouter()
  const auth = router.options.context.auth
  const authState = auth.sessionService.getAuthState()
  const apiClient = auth.authenticatedApiClient
  const canManage = canManageSectors(authState)

  const [sectors, setSectors] = useState<SectorItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createFromSource, setCreateFromSource] = useState<SectorItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SectorItem | null>(null)

  const loadSectors = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getSectors(apiClient)
      setSectors(response)
    } catch (error) {
      setStatusMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "Unable to load sectors.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [apiClient])

  useEffect(() => {
    void loadSectors()
  }, [loadSectors])

  const totalResidents = useMemo(
    () => sectors.reduce((total, sector) => total + sector.resident_count, 0),
    [sectors]
  )

  const sectorColumns = useMemo<ColumnDef<SectorItem>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Sector ID",
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link
            className="font-medium text-primary hover:underline"
            to="/sector-management/$sectorID"
            params={{ sectorID: row.original.id }}
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description ?? "—",
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
      },
      {
        accessorKey: "resident_count",
        header: "Resident Count",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <SectorActionsMenu
            sector={row.original}
            canManage={canManage}
            onEnlist={() => {
              void router.navigate({
                to: "/sector-management/$sectorID",
                params: { sectorID: row.original.id },
              })
            }}
            onCreateFrom={setCreateFromSource}
            onDelete={setDeleteTarget}
          />
        ),
      },
    ],
    [canManage, router]
  )

  const handleCreateSector = async (payload: CreateSectorPayload) => {
    try {
      const created = await createSector(apiClient, payload)
      setStatusMessage({
        kind: "success",
        text: `Created sector ${created.name}.`,
      })
      await loadSectors()
    } catch (error) {
      setStatusMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "Unable to save sector.",
      })
      throw error
    }
  }

  const handleDeleteSector = async (sector: SectorItem) => {
    try {
      await deleteSector(apiClient, sector.id)
      setStatusMessage({
        kind: "success",
        text: `Deleted sector ${sector.name}.`,
      })
      await loadSectors()
    } catch (error) {
      setStatusMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "Unable to delete sector.",
      })
      throw error
    }
  }

  return (
    <main className="space-y-6 px-4">
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Sectors</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{sectors.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Residents</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{totalResidents}</CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Sector Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage sectors and access the enlistment workflow.
            </p>
          </div>
          {canManage ? (
            <Button type="button" onClick={() => setIsCreateDialogOpen(true)}>
              Create Sector
            </Button>
          ) : null}
        </div>

        {statusMessage ? (
          <p
            className={
              statusMessage.kind === "error"
                ? "text-sm text-destructive"
                : "text-sm text-muted-foreground"
            }
          >
            {statusMessage.text}
          </p>
        ) : null}

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading sectors...</p>
            ) : sectors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sectors yet.</p>
            ) : (
              <DataTable
                columns={sectorColumns}
                data={sectors}
                emptyMessage="No sectors yet."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <SectorUpsertDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Create sector"
        description="Create a new sector with a required name and optional description."
        submitLabel="Create sector"
        onSubmit={handleCreateSector}
      />

      <SectorUpsertDialog
        key={createFromSource?.id ?? "create-from"}
        open={createFromSource !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setCreateFromSource(null)
          }
        }}
        title="Create From"
        description="Create a new sector and copy memberships from one or more source sectors."
        submitLabel="Create From"
        defaultSourceSectors={createFromSource ? [createFromSource.id] : []}
        onSubmit={handleCreateSector}
      />

      <DeleteSectorDialog
        open={deleteTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDeleteTarget(null)
          }
        }}
        sector={deleteTarget}
        onDelete={handleDeleteSector}
      />
    </main>
  )
}
