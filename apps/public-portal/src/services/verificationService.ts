import type {
  ResidentProfile,
  VerificationResult,
} from "../types/verification"
/*
TODO: Change the import to I think my Node imports subpath
*/
interface VerifyQRRequest {
  qr_data: string
}

interface VerifyQRResponse {
  status: VerificationResult["status"]
  profile?: ResidentProfile
}

function buildMockProfile(qrType: ResidentProfile["qrType"]): ResidentProfile {
  return {
    lguIdNumber: qrType === "NATIONAL_ID" ? "NAT-00998877" : "LGU-00123456",
    fullName: qrType === "NATIONAL_ID" ? "Alex Santos" : "Maria Dela Cruz",
    birthday: "1990-05-12",
    address: "Sample Barangay, Sample City",
    facePhotoUrl: "https://placehold.co/200x200",
    qrType,
  }
}

export async function verifyQR(rawQRValue: string): Promise<VerificationResult> {
  try {
    const payload: VerifyQRRequest = { qr_data: rawQRValue }

    // TODO: Remove mock logic when backend is connected
    const response = await fetch("/api/v1/public/verify-qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Verification request failed with ${response.status}`)
    }

    const data = (await response.json()) as VerifyQRResponse

    return {
      ...data,
      rawQRValue,
    }
  } catch {
    if (rawQRValue.includes("TAMPERED")) {
      return {
        status: "error_tampered",
        rawQRValue,
      }
    }

    if (rawQRValue.includes("UNREGISTERED")) {
      return {
        status: "error_not_registered",
        rawQRValue,
      }
    }

    if (rawQRValue.includes("NATIONAL")) {
      return {
        status: "success",
        profile: buildMockProfile("NATIONAL_ID"),
        rawQRValue,
      }
    }

    return {
      status: "success",
      profile: buildMockProfile("LGU"),
      rawQRValue,
    }
  }
}
