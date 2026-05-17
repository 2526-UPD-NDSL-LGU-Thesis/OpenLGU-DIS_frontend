export class UploadHttpError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`Upload failed: ${status}`)
    this.name = "UploadHttpError"
    this.status = status
    this.body = body
  }
}

export async function uploadWithProgress(url: string, formData: FormData, onProgress: (p: number) => void, signal?: AbortSignal): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.responseType = 'json'

    xhr.onload = () => {
      const status = xhr.status
      const body = xhr.response
      if (status >= 200 && status < 300) {
        // Wrap xhr.response into a Response-like object
        resolve(new Response(JSON.stringify(body), { status }))
      } else {
        reject(new UploadHttpError(status, body))
      }
    }

    xhr.onerror = () => reject(new Error('Network error'))

    xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)
        try { onProgress(percent) } catch (err) {}
      }
    })

    if (signal) {
      if (signal.aborted) {
        xhr.abort()
        return reject(new DOMException('Aborted', 'AbortError'))
      }
      const onAbort = () => {
        xhr.abort()
        reject(new DOMException('Aborted', 'AbortError'))
      }
      signal.addEventListener('abort', onAbort, { once: true })
    }

    xhr.send(formData)
  })
}
