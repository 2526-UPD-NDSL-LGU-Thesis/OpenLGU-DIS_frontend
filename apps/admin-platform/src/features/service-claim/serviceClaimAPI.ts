/* API helpers for LGU service creation and service claiming flows. */

import type {
  ClaimItem,
  CreateServicePayload,
  ServiceItem,
} from "#/features/service-claim/types/serviceClaim"
import { authenticatedApiClient } from "#/features/auth/auth"

export async function getServices(): Promise<ServiceItem[]> {
  const response = await authenticatedApiClient.request("/services/");

  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }
  
  const responseBody: ServiceItem[] = await response.json();
  console.log(responseBody);
  return responseBody;
}

export async function createService(payload: CreateServicePayload): Promise<ServiceItem> {
  const response = await authenticatedApiClient.request("/services/", {
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

export async function getClaims(serviceID: string): Promise<ClaimItem[]> {
  const encodedServiceID = encodeURIComponent(serviceID)
  const response = await authenticatedApiClient.request(`/services/${encodedServiceID}/claims/`)

  if (!response.ok) {
    throw new Error("Failed to fetch claims")
  }

  return (await response.json()) as ClaimItem[]
}

export async function createClaim(serviceName: string, rawQRValue: string): Promise<ClaimItem> {
  const encodedServiceName = encodeURIComponent(serviceName)
  const response = await authenticatedApiClient.request(`/claim/${encodedServiceName}/`, {
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
