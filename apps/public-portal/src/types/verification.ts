export type QRType = "LGU" | "NATIONAL_ID"

export type VerificationStatus =
  | "idle"
  | "loading"
  | "success"
  | "error_tampered"
  | "error_not_registered"

export interface ResidentProfile {
  lguIdNumber: string
  fullName: string
  birthday: string
  address: string
  facePhotoUrl: string
  qrType: QRType
}

export interface VerificationResult {
  status: VerificationStatus
  profile?: ResidentProfile
  rawQRValue?: string
}
/* 
TODO Verify these types with backend response plus
reflect features well
*/