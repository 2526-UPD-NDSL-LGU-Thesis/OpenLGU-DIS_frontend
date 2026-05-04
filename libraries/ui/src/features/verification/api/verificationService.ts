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

import { authenticatedApiClient } from "../../../../../../apps/admin-platform/src/features/auth/auth.tsx"
import { DoorClosed } from "lucide-react"
// TODO REPLACE

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
    // const response = await fetch(`${apiBase}/qr/verify/`, requestOptions)
    // const response = await authenticatedApiClient.request("/qr/verify/", requestOptions);

    // if (!response.ok) {
    //   throw new HTTPResponseError(response)
    // }

    // const contentType = response.headers.get("content-type")
    // if (!contentType || !contentType.includes("application/json")) {
    //   return {
    //     result: "error_response_is_not_declared_json",
    //     message: "API returned a non-JSON response.",
    //   }
    // }

    // const responseBody = (await response.json()) as QRVerifyResponseBody

    const responseBody = {
            "id_details": {
              "1": "DCS",
              "2": 1777877324,
              "169": {
                "1": "6149804723",
                "2": 1.0,
                "3": "eng",
                "4": "James Ernest T. Geraldo",
                "8": "2001/09/15",
                "9": "Male",
                "62": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAFA3PEY8MlBGQUZaVVBfeMiCeG5uePWvuZHI////////////////////////////////////////////////////wAALCAAtAC0BAREA/8QAGQAAAwEBAQAAAAAAAAAAAAAAAgMEAAEF/8QAHxAAAgICAwADAAAAAAAAAAAAAREAAgMhEjFBBDJR/9oACAEBAAA/ACoBTGHOG9T7OQbWA7MHmD7F3qeRltwE05PkHGy4iGarGDFIJpmCg+owFSnxwDUGzM2T6qJQMyAnDKzoqAQi4u5JBD7iwf2YmNwYhkBb1KMg24mwNrDaAgZCOuUSRvudct+PXjiD7O4ywBqXJxE5jtRfk1bKwKa2p6NLcqC3TDn/2Q==",
                "75": "3481217724",
                "76": [
                  "STUDENT",
                  "RESIDENT"
                ]
              }
            }
    }
    const qrDeet = responseBody.id_details;
    const cwt = qrDeet['169'];
    // TODO fix the parsing of data
    const idDetails = {
      full_name: cwt['4'],
      dob: cwt['8'],
      gender: cwt['9'],
      email: cwt['11'], 
      phone: cwt['12'],
      face: cwt['62'],            
      local_id: cwt['75'],
      issuerType: "LGU",
    } satisfies IdDetails
    console.log(idDetails);
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