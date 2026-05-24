import React, { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@openlguid/ui/components/card"
import { Field, FieldLabel } from "@openlguid/ui/components/field"
import { Input } from "@openlguid/ui/components/input"
import { Textarea } from "@openlguid/ui/components/textarea"
import { Button } from "@openlguid/ui/components/button"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@openlguid/ui/components/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@openlguid/ui/components/dialog"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { ImagePlus } from "lucide-react"
import DatePicker from "@openlguid/ui/components/date-picker"
import { UploadHttpError } from "#/lib/upload"
import {
  buildIssuanceSubmissionFormData,
  type IssuanceEnrollResponseBody,
} from "./issuancePayload"
import { authApiBaseUrl } from "#/features/auth/api/authAPI"
import { parseIssuanceSubmissionFailure } from "./issuanceSubmissionErrors"
import {
  savePhysicalIdReprintCache,
} from "#/features/id-management/reprint-cache"
import {
  clearIssuancePrefill,
  getIssuancePrefill,
} from "./issuance-prefill-store"
import type { PhysicalLGUIDTemplateData } from "@openlguid/physical-id-template/types"
import { setIssuanceSuccessData } from "./issuance-success-store"

interface AuthenticatedRequestClient {
  request: (path: string, init?: RequestInit) => Promise<Response>
}

interface IssuanceWizardProps {
  apiClient?: AuthenticatedRequestClient
}

function getRuntimeAuthenticatedClient(): AuthenticatedRequestClient | undefined {
  const runtimeClient = (globalThis as { __OPENLGU_AUTH_CLIENT?: unknown }).__OPENLGU_AUTH_CLIENT
  if (
    runtimeClient &&
    typeof runtimeClient === "object" &&
    "request" in runtimeClient &&
    typeof (runtimeClient as { request?: unknown }).request === "function"
  ) {
    return runtimeClient as AuthenticatedRequestClient
  }

  return undefined
}

function getIssuanceSubmitUrl(): string {
  const baseUrl = authApiBaseUrl?.trim()
  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, "")}/ids/`
  }

  if (typeof window !== "undefined" && window.location.origin && window.location.origin !== "null") {
    return `${window.location.origin}/ids/`
  }

  return "http://localhost/ids/"
}

const STEPS = [
  { id: "applicant", title: "Applicant", description: "Name and basic info" },
  { id: "documents", title: "Documents", description: "Sectors and proof" },
]

const SECTOR_OPTIONS = [
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "social", label: "Social" },
]

function getSectorLabel(value: string): string {
  return SECTOR_OPTIONS.find((sector) => sector.value === value)?.label ?? value
}

function buildReprintData(value: {
  first_name: string
  middle_name: string
  last_name: string
  suffix_name?: string
  gender: string
  dob: string
  address: string
  phone: string
  face?: string
}, issuedUin: string, pcn?: string): PhysicalLGUIDTemplateData {
  const fullName = [value.first_name, value.middle_name, value.last_name, value.suffix_name]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join(" ")

  return {
    full_name: fullName,
    uin: issuedUin,
    dob: value.dob,
    gender: value.gender,
    address: value.address,
    qrValue: issuedUin,
    pcn,
    phone: value.phone,
    face: value.face,
  }
}


function RouterSafeLink({
  to,
  children,
  className,
  onClick,
}: {
  to: string
  children: React.ReactNode
  className?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        event.preventDefault()
        if (typeof onClick === "function") {
          onClick(event)
        }

        const id = to.replace("#", "")
        const el = document.getElementById(id)
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ block: "center" })
        }

        try {
          if (typeof window.history.pushState === "function") {
            window.history.pushState({}, "", to)
          } else {
            window.location.hash = to
          }
        } catch {}
      }}
    >
      {children}
    </a>
  )
}

export default function IssuanceWizard({ apiClient }: IssuanceWizardProps): JSX.Element {
  const [fileError, setFileError] = useState<string | null>(null)
  const [proofFileName, setProofFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [submissionFieldErrors, setSubmissionFieldErrors] = useState<Record<string, string>>({})
  const MAX_BYTES = 10 * 1024 * 1024
  const formRef = useRef<HTMLFormElement | null>(null)
  const initialPrefill = getIssuancePrefill()
  const resolvedApiClient = apiClient ?? getRuntimeAuthenticatedClient()
  if (initialPrefill) {
    clearIssuancePrefill()
  }

  function navigateToLogin() {
    if (typeof window === "undefined") {
      return
    }

    window.history.pushState({}, "", "/login")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  function navigateToIssuanceSuccess() {
    if (typeof window === "undefined") {
      return
    }

    window.history.pushState({}, "", "/id-management/issuance-success")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  function navigateToDashboard() {
    if (typeof window === "undefined") {
      return
    }

    window.history.pushState({}, "", "/id-management")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  // TanStack form
  // zod schema for issuance
  const IssuanceSchema = z.object({
    first_name: z.string().min(1, { message: 'First name is required.' }),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, { message: 'Last name is required.' }),
    suffix_name: z.string().optional(),
    gender: z.string().optional(),
    pcn: z.string().optional(),
    dob: z.string().optional(),
    address: z.string().optional(),
    contact_number: z.string().optional(),
    sectors: z.array(z.string()).optional(),
    proof: z.any().optional(),
  })

  const form = useForm({
    defaultValues: {
      first_name: initialPrefill?.first_name ?? '',
      middle_name: initialPrefill?.middle_name ?? '',
      last_name: initialPrefill?.last_name ?? '',
      suffix_name: '',
      gender: initialPrefill?.gender ?? '',
      pcn: initialPrefill?.pcn ?? '',
      dob: initialPrefill?.dob ?? '',
      address: initialPrefill?.address ?? '',
      contact_number: initialPrefill?.contact_number ?? '',
      sectors: [],
      proof: null,
    },
    // zod schema
    validate: (values) => {
      // basic zod validation - will return errors object mapping field->message
      try {
        IssuanceSchema.parse(values)
        return undefined
      } catch (err: any) {
        const issues = err?.issues ?? []
        const result: Record<string, string> = {}
        for (const i of issues) {
          if (i.path && i.path.length) result[String(i.path[0])] = i.message
        }
        return result
      }
    },
    onSubmit: async ({ value }) => {
      setFileError(null)
      setSubmissionFieldErrors({})

      const proof = value.proof
      if (!(proof instanceof File)) {
        setFileError('Proof of residence is required.')
        return
      }

      if (proof.type !== 'application/pdf') {
        setFileError('Proof of residence must be a PDF file.')
        return
      }

      if (proof.size > MAX_BYTES) {
        setFileError('Proof of residence exceeds the maximum size of 10 MB.')
        return
      }

      // validate using zod for the rest of fields
      const parsed = IssuanceSchema.safeParse(value)
      if (!parsed.success) {
        const first = parsed.error.issues[0]
        setFileError(first.message || 'Validation failed.')
        return
      }

      const fd = buildIssuanceSubmissionFormData(parsed.data, proof)

      const controller = new AbortController()
      setUploadAbortController(controller)
      setIsUploading(true)
      setUploadProgress(0)

      try {
        const response =
          resolvedApiClient
            ? await resolvedApiClient.request("/ids/", {
                method: "POST",
                body: fd,
                signal: controller.signal,
              })
            : await fetch(getIssuanceSubmitUrl(), {
                method: "POST",
                body: fd,
                credentials: "include",
              })

        if (!response.ok) {
          let errorBody: unknown = null
          try {
            errorBody = await response.json()
          } catch {
            errorBody = null
          }
          throw new UploadHttpError(response.status, errorBody)
        }

        const body = (await response.json()) as IssuanceEnrollResponseBody & {
          uin?: string
          id?: string
          pcn?: string
        }
        const issuedDetails = body.id_details
        const issuedUin = issuedDetails?.uin ?? body.uin ?? body.id
        if (!issuedUin) {
          setFileError('Upload succeeded but no UIN was returned.')
          return
        }

        const issuedQr = body.qr ?? issuedUin

        const nextReprintData = buildReprintData(
          {
            first_name: issuedDetails?.first_name ?? value.first_name,
            middle_name: issuedDetails?.middle_name ?? value.middle_name ?? "",
            last_name: issuedDetails?.last_name ?? value.last_name,
            suffix_name: issuedDetails?.suffix_name ?? value.suffix_name ?? "",
            gender: issuedDetails?.gender ?? value.gender ?? "",
            dob: issuedDetails?.date_of_birth ?? value.dob ?? "",
            address: issuedDetails?.address ?? value.address ?? "",
            phone: issuedDetails?.phone_number ?? value.contact_number ?? "",
            face: issuedDetails?.face_image,
          },
          issuedUin,
          issuedDetails?.pcn ?? body.pcn
        )
        savePhysicalIdReprintCache(nextReprintData)
        setIssuanceSuccessData({
          uin: issuedUin,
          pcn: issuedDetails?.pcn ?? body.pcn,
          qr: issuedQr,
          preview: nextReprintData,
        })
        setUploadProgress(100)
        navigateToIssuanceSuccess()
      } catch (err: any) {
        if (err && err.name === 'AbortError') {
          setFileError('Upload cancelled.')
          return
        }

        const failure = parseIssuanceSubmissionFailure(err)
        if (!failure) {
          return
        }

        if (failure.kind === "auth") {
          navigateToLogin()
          return
        }

        if (failure.kind === "validation") {
          setSubmissionFieldErrors(failure.fieldErrors)
          setFileError(
            failure.fieldErrors.proof_of_residence ??
              failure.fieldErrors.proof ??
              failure.message
          )
        } else {
          setFileError(failure.message)
        }
      } finally {
        setIsUploading(false)
        setUploadAbortController(null)
      }
    },
  })

  function handleCancel() {
    // reset form and local state
    setFileError(null)
    setSubmissionFieldErrors({})
    setProofFileName(null)
    setIsUploading(false)
    setUploadProgress(null)
    if (uploadAbortController) {
      uploadAbortController.abort()
      setUploadAbortController(null)
    }
    if (formRef.current) formRef.current.reset()
  }

  // refs for scrolling
  const refs = useRef<Partial<Record<string, React.RefObject<HTMLElement>>>>({})
  STEPS.forEach((s) => {
    if (!refs.current[s.id]) refs.current[s.id] = React.createRef<HTMLElement>()
  })

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Issuance</CardTitle>
        <div>
          <Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)}>Cancel issuance</Button>
        </div>
      </CardHeader>
      <CardContent>
        <form ref={formRef} role="form" aria-label="Issuance form" onSubmit={(event)=>{ event.preventDefault(); event.stopPropagation(); void form.handleSubmit() }}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-3/4 space-y-8">
              {STEPS.map((s, idx) => (
                <section
                  key={s.id}
                  id={`step-${s.id}`}
                  ref={refs.current[s.id]}
                  aria-labelledby={`step-${s.id}-label`}
                  className="py-4"
                >
                  <h2 id={`step-${s.id}-label`} className="text-lg font-semibold">{idx + 1}. {s.title}</h2>
                  <div className="text-sm text-muted-foreground mb-2">{s.description}</div>

                  <div>
                    {s.id === "applicant" && (
                      <div className="space-y-4">
                        <form.Field name="pcn">
                          {(field: any) => (
                            <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
                              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                PCN
                              </div>
                              <div className="mt-1 text-sm font-semibold text-foreground">
                                {field.state.value || "Empty"}
                              </div>
                            </div>
                          )}
                        </form.Field>

                        <div className="grid gap-4 md:grid-cols-2">
                          <form.Field name="first_name">
                            {(field: any) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  aria-label="First name"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e: any) => field.handleChange(e.target.value)}
                                />
                                {submissionFieldErrors.first_name ? (
                                  <div role="alert" className="text-sm text-destructive">
                                    {submissionFieldErrors.first_name}
                                  </div>
                                ) : null}
                              </Field>
                            )}
                          </form.Field>

                          <form.Field name="suffix_name">
                            {(field: any) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Suffix name</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  aria-label="Suffix name"
                                  value={field.state.value}
                                  placeholder="Jr., Sr., III (optional)"
                                  onBlur={field.handleBlur}
                                  onChange={(e: any) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          </form.Field>

                          <form.Field name="middle_name">
                            {(field: any) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Middle name</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  aria-label="Middle name"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e: any) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          </form.Field>

                          <form.Field name="last_name">
                            {(field: any) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  aria-label="Last name"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e: any) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          </form.Field>

                          <form.Field name="gender">
                            {(field: any) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Gender</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  aria-label="Gender"
                                  value={field.state.value}
                                  placeholder="Male / Female / Other"
                                  onBlur={field.handleBlur}
                                  onChange={(e: any) => field.handleChange(e.target.value)}
                                />
                                {submissionFieldErrors.gender ? (
                                  <div role="alert" className="text-sm text-destructive">
                                    {submissionFieldErrors.gender}
                                  </div>
                                ) : null}
                              </Field>
                            )}
                          </form.Field>

                          <form.Field name="dob">
                            {(field: any) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Date of birth</FieldLabel>
                                <DatePicker
                                  id={field.name}
                                  name={field.name}
                                  aria-label="Date of birth"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e: any) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          </form.Field>

                          <form.Field name="contact_number">
                            {(field: any) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Contact number</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  aria-label="Contact number"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e: any) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          </form.Field>

                          <div className="md:col-span-2">
                            <form.Field name="address">
                              {(field: any) => (
                                <Field>
                                  <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                                  <Textarea
                                    id={field.name}
                                    name={field.name}
                                    aria-label="Address"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e: any) => field.handleChange(e.target.value)}
                                  />
                                </Field>
                              )}
                            </form.Field>
                          </div>
                        </div>
                      </div>
                    )}

                    {s.id === "documents" && (
                      <>
                        <form.Field name="sectors">
                          {(field: any) => (
                            <Field>
                              <FieldLabel htmlFor={field.name}>Sectors</FieldLabel>
                              <Combobox
                                items={SECTOR_OPTIONS.map((sector) => sector.value)}
                                multiple
                                value={field.state.value}
                                onValueChange={(next) => field.handleChange(next)}
                              >
                                <ComboboxChips>
                                  <ComboboxValue>
                                    {field.state.value.map((value: string) => (
                                      <ComboboxChip key={value}>{getSectorLabel(value)}</ComboboxChip>
                                    ))}
                                  </ComboboxValue>
                                  <ComboboxChipsInput
                                    id={field.name}
                                    name={field.name}
                                    aria-label="Sectors"
                                    placeholder="Add sectors"
                                    onBlur={field.handleBlur}
                                  />
                                </ComboboxChips>
                                <ComboboxContent>
                                  <ComboboxEmpty>No sectors found.</ComboboxEmpty>
                                  <ComboboxList>
                                    {(item) => (
                                      <ComboboxItem key={item} value={item}>
                                        {getSectorLabel(item)}
                                      </ComboboxItem>
                                    )}
                                  </ComboboxList>
                                </ComboboxContent>
                              </Combobox>
                            </Field>
                          )}
                        </form.Field>

                        <Field>
                          <FieldLabel>Proof of residence</FieldLabel>
                          <form.Field name="proof">{(field: any) => (
                              <div className="space-y-2">
                                <input
                                  id={field.name}
                                  name={field.name}
                                  type="file"
                                  aria-label="Proof of residence"
                                  className="sr-only"
                                  onChange={(e:any) => {
                                    const selected = e.target.files?.[0] ?? null
                                    field.handleChange(selected)
                                    setProofFileName(selected?.name ?? null)
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const proofInput = document.getElementById(field.name) as HTMLInputElement | null
                                    proofInput?.click()
                                  }}
                                >
                                  <ImagePlus className="size-4" />
                                  Upload proof PDF
                                </Button>
                                {proofFileName ? (
                                  <p className="text-xs text-muted-foreground">{proofFileName}</p>
                                ) : null}
                                {submissionFieldErrors.proof ? (
                                  <div role="alert" className="text-sm text-destructive">
                                    {submissionFieldErrors.proof}
                                  </div>
                                ) : null}
                              </div>
                            )}</form.Field>
                          {fileError ? (
                            <div role="alert" className="mt-2 text-sm text-destructive">
                              {fileError}
                            </div>
                          ) : null}

                          {isUploading && uploadProgress !== null && (
                            <div className="mt-2">
                              <div className="w-full bg-slate-100 rounded h-2">
                                <div className="bg-primary h-2 rounded" style={{ width: `${uploadProgress}%` }} />
                              </div>
                              <div className="text-sm mt-1">{uploadProgress}%</div>
                              <div className="mt-2">
                                <Button variant="outline" onClick={() => uploadAbortController?.abort()}>Cancel upload</Button>
                              </div>
                            </div>
                          )}
                        </Field>
                      </>
                    )}

                  </div>
                </section>
              ))}
            </div>

            <aside className="hidden md:block md:w-1/4">
              <div className="sticky top-1/3">
                <nav aria-label="Table of contents">
                  <ul className="m-0 flex w-fit list-none flex-col gap-2 p-0">
                    {STEPS.map((s, idx) => (
                      <li key={s.id}>
                        <RouterSafeLink
                          to={`#step-${s.id}`}
                          className="flex items-center gap-3 p-2 rounded hover:bg-slate-50"
                          onClick={() => {
                            const id = `step-${s.id}`
                            const el = document.getElementById(id)
                            if (el && typeof (el as any).scrollIntoView === 'function') {
                              ;(el as any).scrollIntoView({ block: "center" })
                            }
                          }}
                        >
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border">{idx + 1}</span>
                          <div className="text-left">
                            <div className="font-medium">{s.title}</div>
                            <div className="text-sm text-muted-foreground">{s.description}</div>
                          </div>
                        </RouterSafeLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          </div>

          <div className="mt-6 text-right">
            <Button type="submit">Submit</Button>
          </div>
        </form>

        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel issuance</DialogTitle>
              <DialogDescription>Are you sure you want to cancel this issuance? All entered data will be lost.</DialogDescription>
            </DialogHeader>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>No, keep it</Button>
              <Button variant="destructive" onClick={() => { setIsCancelDialogOpen(false); handleCancel(); navigateToDashboard(); }}>Yes, cancel</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
