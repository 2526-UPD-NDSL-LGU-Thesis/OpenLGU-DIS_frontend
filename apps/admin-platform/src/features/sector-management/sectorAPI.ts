import type { AuthenticatedApiClient } from "#/features/auth/authenticated-api-client"

import type {
  CreateSectorPayload,
  EnlistResponse,
  SectorItem,
} from "./types"

type ApiErrorBody = {
  message?: string
  detail?: string
  error?: string
}

async function readErrorMessage(response: Response): Promise<string | null> {
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return null
  }

  try {
    const body = (await response.json()) as ApiErrorBody
    return body.message ?? body.detail ?? body.error ?? null
  } catch {
    return null
  }
}

async function assertOk(response: Response, fallbackMessage: string): Promise<Response> {
  if (response.ok) {
    return response
  }

  const message = await readErrorMessage(response)
  throw new Error(message ?? fallbackMessage)
}

function sectorPath(sectorID: string): string {
  if (!sectorID || sectorID.trim().length === 0 || sectorID === "undefined") {
    throw new Error("Sector ID is required.")
  }

  return encodeURIComponent(sectorID)
}

export async function getSectors(apiClient: AuthenticatedApiClient): Promise<SectorItem[]> {
  const response = await apiClient.request("/sectors/")
  await assertOk(response, "Failed to fetch sectors.")
  return (await response.json()) as SectorItem[]
}

export async function createSector(
  apiClient: AuthenticatedApiClient,
  payload: CreateSectorPayload
): Promise<SectorItem> {
  const response = await apiClient.request("/sectors/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  await assertOk(response, "Failed to create sector.")
  return (await response.json()) as SectorItem
}

export async function deleteSector(
  apiClient: AuthenticatedApiClient,
  sectorID: string
): Promise<void> {
  const response = await apiClient.request(`/sectors/${sectorPath(sectorID)}/`, {
    method: "DELETE",
  })

  await assertOk(response, "Failed to delete sector.")
}

export async function enlistResidentToSector(
  apiClient: AuthenticatedApiClient,
  sectorID: string,
  rawQRValue: string
): Promise<EnlistResponse> {
  const response = await apiClient.request(`/ids/enlist/`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ qr: rawQRValue, sector: [sectorPath(sectorID)] }),
  })

  await assertOk(response, "Failed to enlist resident to sector.")
  return (await response.json()) as EnlistResponse
}
