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
  result: VerificationResult["result"]
  failedMsg?: string; // TODO NEEDS TO BE MORE ELEGANT. Combining profile and failedMsg + THERE IS OVERLAP IN VERIFICATION.TS
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
    //console.log(JSON.stringify(payload));
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    
    // TODO: Remove mock logic when backend is connected
    const response = await fetch(`${apiBase}/api/authenticate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log(response)
    if (!response.ok) {
      throw new Error(`Verification request failed with ${response.status}`)
    }

    const data = (await response.json()) as VerifyQRResponse;
    console.log("why are we not here")

    return {
      ...data,
      rawQRValue,
    }
  } catch {
    console.log("we're here for some reason")
    if (rawQRValue.includes("TAMPERED")) {
      return {
        status: "error_tampered",
        rawQRValue,
      }
    }

    return {
      result: "random_qr",
      rawQRValue,
    }
  }
}
