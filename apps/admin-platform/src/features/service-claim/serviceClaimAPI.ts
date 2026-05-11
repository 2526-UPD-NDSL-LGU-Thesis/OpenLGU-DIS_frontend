/* API helpers for LGU service creation and service claiming flows. */

import type {
  ClaimItem,
  CreateServicePayload,
  ServiceItem,
} from "#/features/service-claim/types/serviceClaim"
import type { AuthenticatedApiClient } from "#/features/auth/authenticated-api-client"

const inFlightClaimsByClient = new WeakMap<AuthenticatedApiClient, Map<string, Promise<ClaimItem>>>()

function claimSingleFlightKey(serviceID: string, rawQRValue: string): string {
  return `${serviceID}::${rawQRValue}`
}

function getInFlightClaims(apiClient: AuthenticatedApiClient): Map<string, Promise<ClaimItem>> {
  const existing = inFlightClaimsByClient.get(apiClient)
  if (existing) {
    return existing
  }

  const created = new Map<string, Promise<ClaimItem>>()
  inFlightClaimsByClient.set(apiClient, created)
  return created
}

function assertValidServiceID(serviceID: string) {
  if (!serviceID || serviceID === "undefined" || serviceID.trim().length === 0) {
    throw new Error("Service ID is required.")
  }
}

export async function getServices(apiClient: AuthenticatedApiClient): Promise<ServiceItem[]> {
  const response = await apiClient.request("/services/")

  if (!response.ok) {
    throw new Error("Failed to fetch services")
  }

  return (await response.json()) as ServiceItem[]
}

export async function createService(
  apiClient: AuthenticatedApiClient,
  payload: CreateServicePayload
): Promise<ServiceItem> {
  const response = await apiClient.request("/services/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to create service")
  }

  return (await response.json()) as ServiceItem
}

export async function getClaims(
  apiClient: AuthenticatedApiClient,
  serviceID: string
): Promise<ClaimItem[]> {
  assertValidServiceID(serviceID)
  const encodedServiceID = encodeURIComponent(serviceID)
  const response = await apiClient.request(
    `/services/${encodedServiceID}/claims/`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch claims")
  }

  return (await response.json()) as ClaimItem[]
}

export async function createClaim(
  apiClient: AuthenticatedApiClient,
  serviceID: string,
  rawQRValue: string
): Promise<ClaimItem> {
  assertValidServiceID(serviceID)
  const key = claimSingleFlightKey(serviceID, rawQRValue)
  const inFlight = getInFlightClaims(apiClient)
  const pending = inFlight.get(key)
  if (pending) {
    return pending
  }

  const requestPromise = (async () => {
    const encodedServiceID = encodeURIComponent(serviceID)
    const response = await apiClient.request(`/claim/${encodedServiceID}/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ qr: rawQRValue }),
    })

    if (!response.ok) {
      throw new Error("Failed to create claim")
    }

    return (await response.json()) as ClaimItem
  })()

  inFlight.set(key, requestPromise)
  return requestPromise.finally(() => {
    inFlight.delete(key)
  })
}
