export type VerificationResult =
  | "idle"
  | "success"
  | "error_not_base45"
  | "error_not_compressed"
  | "error_tampered"
  | "error_not_registered"
  | "error_response_is_not_declared_json"
  | "error_random_qr"
  | "error_other"
// TODO: migrate to https://www.typescriptlang.org/docs/handbook/enums.html


/* Backend Dependent */

export interface IdDetails {// TODO possibly have a better agreed upon set of fields
  uin: string
  pcn?: string
  full_name: string
  dob: string
  gender: string
  location?: string
  email: string
  phone: string
  face: string
}

export interface QRVerifyResponseIdDetails {
  [key: string]: unknown
  uin?: string
  pcn?: string
  full_name?: string
  dob?: string
  gender?: string
  location?: string
  email?: string
  phone?: string
  face?: string
}

export interface QRVerifyRequestBody {
  qr: string
}

export interface QRVerifyResponseBody {
  qr_type?: string
  error?: VerificationResult
  message?: string
  id_details?: QRVerifyResponseIdDetails & { "169"?: QRVerifyResponseIdDetails }
}
