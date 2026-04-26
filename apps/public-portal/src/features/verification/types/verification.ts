/* Shared types of verification feature */

export type issuerType = "LGU" | "NATIONAL"

export type VerificationResult =
  | "success"
  | "error_not_base45"
  | "error_not_compressed"
  | "error_tampered"
  | "error_not_registered"
  | "error_response_is_not_declared_json"
  | "error_random_qr"
  | "error_other"

/* Backend Dependent */

export interface IdDetails { // TODO possibly have a better agreed upon set of fields
  local_id: string
  full_name: string
  dob: string
  location: string
  face: string
  issuerType: issuerType
}

export interface QRVerifyRequestBody {
  qr: string
}

export interface QRVerifyResponseBody {
  error?: VerificationResult,
  message?: string,
  cwt: Omit<IdDetails, 'issuerType'>,
}
