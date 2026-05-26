export interface NationalIdVerificationDetails {
  first_name?: string
  middle_name?: string
  last_name?: string
  suffix_name?: string
  gender?: string
  birthdate?: string
  address?: string
  email_id?: string
  phone?: string
  face?: string
  pcn?: string
}

export interface NationalIdVerificationResponseDetails {
  first_name?: string
  middle_name?: string
  last_name?: string
  suffix_name?: string
  gender?: string
  date_of_birth?: string
  address?: string
  email_id?: string
  phone_number?: string
  face_image?: string
  pcn?: string
}

export interface NationalIdVerificationResponse {
  qr_type?: string
  id_details?: NationalIdVerificationResponseDetails
  message?: string
  detail?: string
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
    ? await apiClient.request("/verify/qr/", requestInit)
    : await fetch("/api/verify/qr/", requestInit)

  if (!response.ok) {
    throw new Error("Verification failed. Please try again.")
  }

  const body = (await response.json()) as NationalIdVerificationResponse
  if (!body.id_details) {
    throw new Error(body.message ?? body.detail ?? "No National ID details were returned.")
  }

  return {
    first_name: body.id_details.first_name,
    middle_name: body.id_details.middle_name,
    last_name: body.id_details.last_name,
    suffix_name: body.id_details.suffix_name,
    gender: body.id_details.gender,
    birthdate: body.id_details.date_of_birth,
    address: body.id_details.address,
    email_id: body.id_details.email_id,
    phone: body.id_details.phone_number,
    face: body.id_details.face_image,
    pcn: body.id_details.pcn,
  }
}
