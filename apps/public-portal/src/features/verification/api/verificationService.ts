/* Handles identity verification api calls and translate the backend */


import type {
  QRVerifyRequestBody, QRVerifyResponseBody, VerificationResult, IdDetails
} from "#features/verification/types/verification.js"

interface QRVerifyReturn {
  result?: VerificationResult
  idDetails?: IdDetails,
  message?: string,
}


export async function verifyQR(rawQRValue: string): Promise<QRVerifyReturn> {
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL;

    const requestBody: QRVerifyRequestBody = {
      qr: rawQRValue 
    }

    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    }

    const response = await fetch(`${apiBase}/qr/verify`, request);

    if (!response.ok){
      throw Error(`Verification spectacularly request failed with ${response.status}`);
    }

    const responseBody = (await response.json()) as QRVerifyResponseBody;

    if (responseBody.error) {
      return { result: responseBody.error };
    }
    else {

      const idDetails = {
        ...responseBody.cwt,
        issuerType: "LGU",
      } satisfies IdDetails;

      return {
        result: "success",
        idDetails
      }
    }
  }

  catch (error) {
    return {
      result: "other_error",
      message: error instanceof Error ? error.message : "Unknown verification error",
    }
  }
}
