export interface NationalIdVerificationDetails {
  first_name?: string
  middle_name?: string
  last_name?: string
  gender?: string
  birthdate?: string
  address?: string
  phone?: string
  face?: string
  pcn?: string
}

export interface NationalIdVerificationResponse {
  id_details?: NationalIdVerificationDetails
  message?: string
}

interface AuthenticatedRequestClient {
  request: (path: string, init?: RequestInit) => Promise<Response>
}

export async function verifyNationalId(
  rawQRValue: string,
  apiClient?: AuthenticatedRequestClient
): Promise<NationalIdVerificationDetails> {
  const requestInit: RequestInit = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ qr: rawQRValue }),
    credentials: "include",
  }

  const response = apiClient
    ? await apiClient.request("/mosip/verify/", requestInit)
    : await fetch("/api/mosip/verify/", requestInit)

  if (!response.ok) {
    throw new Error("Verification failed. Please try again.")
  }

  const body = (await response.json()) as NationalIdVerificationResponse
  if (!body.id_details) {
    throw new Error(body.message ?? "No National ID details were returned.")
  }

  return body.id_details
}
