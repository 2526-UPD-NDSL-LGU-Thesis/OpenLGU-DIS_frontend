/* Handles identity verification api calls */


import type {
  VerificationResult,
} from "#features/verification/types/verification.js"

interface VerifyQRRequest {
  qr_data: string
}

interface VerifyQRResponse extends Omit<VerificationResult, 'rawQRValue'>{ }


export async function verifyQR(rawQRValue: string): Promise<VerificationResult> {
  try {
    const payload: VerifyQRRequest = { 
      qr_data: rawQRValue 
    }
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    

    const response = await fetch(`${apiBase}/api/authenticate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    
    if (!response.ok) {
      throw new Error(`Verification request failed with ${response.status}`)
    }


    const responseBody = (await response.json()) as VerifyQRResponse;
    console.log("why are we not here")

    return {
      ...responseBody,
      rawQRValue,
    }
  }

  catch {
    console.log("we're here for some reason") // TODO properly catch error test cases
    if (rawQRValue.includes("TAMPERED")) { // TODO Why is this if like this. Also, if the handling is done in the backend, I shouldn't need to make these recognitions. Results, message, and rawQRValue should be modeled in the backend
      return {
        result: "error_tampered",
        message: "This QR has been tampered with!",
        rawQRValue,
      }
    }

    return {
      result: "random_qr",
      message: "This is not the right kind of QR",
      rawQRValue,
    }
  }
}
