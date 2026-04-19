/* Shared types of verification feature */

export type issuerType = "LGU" | "NATIONAL"

export type VerificationStatus =
  | "idle"
  | "loading"
  | "success"
  | "error_tampered"
  | "error_not_registered"
  | "random_qr"
  | "other_error"

export interface IdDetails { // TODO SHOULD REFERENCE A DOCS FOR THESE Details AS ITS PARITY WITH BACKEND ALSO NAMING CONVENTION VAR AAAAA DIFFERENCE. Must verify this type models well the backend
  lgu_uuid: string
  full_name: string
  birthdate: string
  address?: string
  face_data: string
  issuerType: issuerType
}

export interface VerificationResult { // TODO what exactly is this for. It has weird overlaps with VerifyQRResponse which is clearly about api response. What does this model is the core question.
  // It appears to be like, the verification result of the hook? Or the scanner? Or the overall feature set?
  // Or at elast, it seems to model just, the service's result
  // Do I really need to do it like this though? What if I just model response directly. Or I don't know. Can't I add additional optional properties anyway? rawQRValue relevance?
  result: VerificationStatus
  idDetails?: IdDetails
  message?: string
  rawQRValue?: string
}