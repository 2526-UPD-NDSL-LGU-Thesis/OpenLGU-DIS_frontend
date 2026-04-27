/* Handles identity verification api calls and translate the backend */
// TODO possibly do credentials: "include" for auth https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#including_credentials
// TODO need to review this
import type {
  IdDetails,
  QRVerifyRequestBody,
  QRVerifyResponseBody,
  VerificationResult,
} from "@openlguid/ui/features/verification/types/verification"

export interface QRVerifyReturn {
  result?: VerificationResult
  idDetails?: IdDetails
  message?: string
}

class HTTPResponseError extends Error {
  response: Response

  constructor(response: Response) {
    super(`HTTPResponseError: ${response.status} ${response.statusText}`)
    this.name = "HTTPResponseError"
    this.response = response
  }
}

export async function verifyQR(rawQRValue: string): Promise<QRVerifyReturn> {
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL

    const requestBody: QRVerifyRequestBody = {
      qr: rawQRValue,
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }

    const response = await fetch(`${apiBase}/qr/verify`, requestOptions)

    if (!response.ok) {
      throw new HTTPResponseError(response)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return {
        result: "error_response_is_not_declared_json",
        message: "API returned a non-JSON response.",
      }
    }

    const responseBody = (await response.json()) as QRVerifyResponseBody

    const idDetails = {
      ...responseBody.cwt,
      issuerType: "LGU",
    } satisfies IdDetails

    return {
      result: "success",
      idDetails,
    }
  } catch (error) {
    if (error instanceof HTTPResponseError) {
      let responseBody: QRVerifyResponseBody | undefined

      try {
        responseBody = (await error.response.json()) as QRVerifyResponseBody
      } catch {
        return {
          result: "error_other",
          message: "Verification failed and response body could not be parsed.",
        }
      }

      if (responseBody.error) {
        return {
          result: responseBody.error,
          message: responseBody.message,
        }
      }

      return {
        result: "error_other",
        message: "Verification failed.",
      }
    }

    return {
      result: "error_other",
      message: "Network error while verifying QR. Please try again.",
    }
  }
}


/*


Original

import type {
  QRVerifyRequestBody, QRVerifyResponseBody, VerificationResult, IdDetails
} from "#/features/verification/types/verification.js"

export interface QRVerifyReturn {
  result?: VerificationResult
  idDetails?: IdDetails,
  message?: string,
}

class HTTPResponseError extends Error {
  response: Response;

	constructor(response: Response) {
		super(`HTTPResponseError: ${response.status} ${response.statusText}`);
    this.name = "HTTPResponseError";
		this.response = response;
	}

  responseBodyEmpty(){
    
  }
}



export async function verifyQR(rawQRValue: string): Promise<QRVerifyReturn> {
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL;

    const requestBody: QRVerifyRequestBody = {
      qr: rawQRValue 
    }

    const requestOptions = {
      method: "POST", // TODO possibly do credentials: "include" for auth https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#including_credentials
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody)
    }

    const response = await fetch(`${apiBase}/qr/verify`, requestOptions);


    // Error Catching

    if (!response.ok) {
      throw new HTTPResponseError(response);
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("error_response_is_not_declared_json");
    }

    const responseBody = (await response.json()) as QRVerifyResponseBody;

    const idDetails = {
      ...responseBody.cwt,
      issuerType: "LGU",
    } satisfies IdDetails;

    return {
      result: "success",
      idDetails
    }
  }

  catch (e) {
    // Handle expected exceptions

    if (e === "error_response_is_not_declared_json"){ // TODO Improve this error handling to be 
        // Inspirations: https://gist.github.com/odewahn/5a5eeb23279eed6a80d7798fdb47fe91
        throw Error("API error: did not declare response as json. Fix api.");
    }
    else if (e instanceof HTTPResponseError) {
      const responseBody = (await e.response.json()) as QRVerifyResponseBody;

      if (responseBody.error){ // TODO Improve by specifically identifying that the errors are the specified of VerificationResult
        return { result: responseBody.error };
      }
      else {
        throw e;
      }
    }
    else { // Rethrow the unexpected
      throw e;
    }
  }




}

*/