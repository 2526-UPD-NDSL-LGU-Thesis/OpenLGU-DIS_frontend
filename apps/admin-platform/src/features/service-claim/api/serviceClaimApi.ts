/* API helpers for LGU service creation and service claiming flows. */

import type {
  ClaimItem,
  CreateServicePayload,
  ServiceItem,
} from "#/features/service-claim/types/serviceClaim"

function getApiBaseUrl(): string {
  const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ""
  return rawBaseUrl.replace(/\/$/, "")
}

function toUrl(path: string): string {
  const base = getApiBaseUrl()

  if (!base) {
    return path
  }

  return `${base}${path}`
}

export async function getServices(): Promise<ServiceItem[]> {
  const response = await fetch(toUrl("/services/"))

  if (!response.ok) {
    throw new Error("Failed to fetch services")
  }

  return (await response.json()) as ServiceItem[]
}

export async function createService(payload: CreateServicePayload): Promise<ServiceItem> {
console.log(payload);
  const response = await fetch(toUrl("/services/"), {
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

export async function getClaims(serviceName: string): Promise<ClaimItem[]> {
  const encodedServiceName = encodeURIComponent(serviceName)
  const response = await fetch(toUrl(`/services/${encodedServiceName}/claims/`))

  if (!response.ok) {
    throw new Error("Failed to fetch claims")
  }

  return (await response.json()) as ClaimItem[]
}

export async function createClaim(serviceName: string, rawQRValue: string): Promise<ClaimItem> {
  const encodedServiceName = encodeURIComponent(serviceName)
  console.log(encodedServiceName);
  const response = await fetch(toUrl(`/claim/${encodedServiceName}/`), {
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
