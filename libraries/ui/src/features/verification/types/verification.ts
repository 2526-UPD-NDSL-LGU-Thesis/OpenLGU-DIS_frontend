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

export interface IdDetails {
  issuer: string,
  issued_at: string
  pcn?: string
  version: string
  first_name: string
  middle_name: string
  last_name: string
  suffix_name: string
  dob: string
  pob?: string
  gender: string
  marital_status: string,
  blood_type: string,
  email: string
  phone: string
  face: string
  uin: string
}


export interface QRVerifyRequestBody {
  qr: string
}

export interface QRVerifyResponseBody {
  qr_type?: string
  error?: VerificationResult
  message?: string
  id_details?: IdDetails
}
