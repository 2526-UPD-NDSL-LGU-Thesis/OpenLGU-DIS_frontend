import { UploadHttpError } from "#/lib/upload"

export type IssuanceSubmissionFailure =
  | {
      kind: "auth"
      message: string
    }
  | {
      kind: "validation"
      message: string
      fieldErrors: Record<string, string>
    }
  | {
      kind: "server"
      message: string
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function firstString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const message = firstString(entry)
      if (message) {
        return message
      }
    }
  }

  return null
}

function readMessage(body: unknown): string | null {
  if (!isRecord(body)) {
    return null
  }

  return firstString(body.detail) ?? firstString(body.message) ?? firstString(body.error)
}

function readFieldErrors(body: unknown): Record<string, string> {
  if (!isRecord(body)) {
    return {}
  }

  const candidate = body.errors ?? body.field_errors ?? body.fields
  if (!isRecord(candidate)) {
    return {}
  }

  const result: Record<string, string> = {}
  for (const [field, value] of Object.entries(candidate)) {
    const message = firstString(value)
    if (message) {
      result[field] = message
    }
  }

  return result
}

export function parseIssuanceSubmissionFailure(error: unknown): IssuanceSubmissionFailure | null {
  if (error instanceof UploadHttpError) {
    if (error.status === 401 || error.status === 403) {
      return {
        kind: "auth",
        message: "Please sign in again to continue issuance.",
      }
    }

    if (error.status === 400 || error.status === 422) {
      return {
        kind: "validation",
        message: readMessage(error.body) ?? "Please review the highlighted fields.",
        fieldErrors: readFieldErrors(error.body),
      }
    }

    return {
      kind: "server",
      message: "Submission failed. Please try again.",
    }
  }

  if (error instanceof Error && error.name === "AbortError") {
    return null
  }

  return {
    kind: "server",
    message: "Submission failed. Please try again.",
  }
}
