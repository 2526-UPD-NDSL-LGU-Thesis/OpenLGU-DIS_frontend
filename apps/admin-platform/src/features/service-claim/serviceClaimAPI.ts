/* API helpers for LGU service creation and service claiming flows. */

import type {
  ClaimItem,
  CreateServicePayload,
  ServiceItem,
} from "#/features/service-claim/types/serviceClaim"
import type { AuthenticatedApiClient } from "#/features/auth/authenticated-api-client"

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
}
