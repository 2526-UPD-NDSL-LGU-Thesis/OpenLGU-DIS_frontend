/* Handles identity verification api calls and translate the backend */
import type {
  IdDetails,
  QRVerifyRequestBody,
  QRVerifyResponseBody,
  VerificationResult,
} from "@openlguid/ui/features/verification/types/verification"

export interface QRVerifyReturn {
  result?: VerificationResult
  qr_type?: string
  idDetails?: IdDetails
  message?: string
  rawQRValue?: string
}

class HTTPResponseError extends Error {
  response: Response

  constructor(response: Response) {
    super(`HTTPResponseError: ${response.status} ${response.statusText}`)
    this.name = "HTTPResponseError"
    this.response = response
  }
}

export type VerificationRequestClient = (
  path: string,
  init?: RequestInit
) => Promise<Response>

// Use an authenticated API client when available to ensure requests include
// auth/session context (cookies, authorization headers) and centralized retry
// handling. Admin and other authenticated apps should register their client
// (e.g., via globalThis.__OPENLGU_AUTH_CLIENT or by calling
// setVerificationRequestClient) during app initialization.
function defaultVerificationRequestClient(path: string, init?: RequestInit): Promise<Response> {
  const apiBase =
    (import.meta as ImportMeta & { env: { VITE_API_BASE_URL?: string } }).env.VITE_API_BASE_URL ??
    ""

  const authClient = (globalThis as any).__OPENLGU_AUTH_CLIENT
  if (authClient && typeof authClient.request === "function") {
    // Delegate to the authenticated client's request method so authentication
    // and base URL handling stay centralized in the app layer.
    return authClient.request(path, init)
  }

  return fetch(`${apiBase}${path}`, {
    ...init,
    credentials: "include",
  })
}

let verificationRequestClient: VerificationRequestClient = defaultVerificationRequestClient

// Tests can override the request client; production uses fetch with cookies included.
export function setVerificationRequestClient(client: VerificationRequestClient | null): void {
  verificationRequestClient = client ?? defaultVerificationRequestClient
}

function toStringValue(value: unknown): string | undefined {
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined
}

function toRequiredString(value: unknown): string {
  return toStringValue(value) ?? ""
}

export async function verifyQR(rawQRValue: string): Promise<QRVerifyReturn> {
  try {
    console.log(rawQRValue);
    const requestBody: QRVerifyRequestBody = {
      qr: rawQRValue,
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include" as RequestCredentials,
    }

    const response = await verificationRequestClient("/verify/qr/", requestOptions)

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

    const responseBody = (await response.json()) as QRVerifyResponseBody;

    const id_details = responseBody.id_details;
    
    return {
      result: "success",
      qr_type: responseBody.qr_type,
      responseBody.id_details,
      rawQRValue
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
