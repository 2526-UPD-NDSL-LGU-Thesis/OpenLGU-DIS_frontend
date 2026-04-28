
interface loginResponseBody {
  accessToken: string,
}

interface loginReturn {

}

class HTTPResponseError extends Error {
  response: Response

  constructor(response: Response) {
    super(`HTTPResponseError: ${response.status} ${response.statusText}`)
    this.name = "HTTPResponseError"
    this.response = response
  }
}

export async function login(username: string, password: string): Promise<loginReturn> {
    const apiBase = import.meta.env.VITE_API_BASE_URL

    const requestBody = {
      username,
      password 
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
    const response = await fetch(`${apiBase}/login/`, requestOptions)

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

    const responseBody = (await response.json()) as loginResponseBody

    return responseBody;
};