export type QRType = "LGU" | "NATIONAL_ID"

export type VerificationStatus =
  | "idle"
  | "loading"
  | "success"
  | "error_tampered"
  | "error_not_registered"
  | "other error"

export interface ResidentProfile { // TODO SHOULD REFERENCE A DOCS FOR THE PROFILE AS ITS PARITY WITH BACKEND ALSO NAMING CONVENTION VAR AAAAA DIFFERENCE
  lgu_uuid: string
  full_name: string
  birthdate: string
  address?: string
  face_data: string
  qrType: QRType
}

export interface VerificationResult {
  result: VerificationStatus
  profile?: ResidentProfile
  failedMsg?: string
  rawQRValue?: string
}
/* 
TODO Verify these types with backend response plus
reflect features well
*/