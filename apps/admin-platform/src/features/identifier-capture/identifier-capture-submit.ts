import type { IdentifierCaptureRequest } from "@openlguid/ui/features/verification/components/IdentifierCaptureDialog"

// TODO yes, this seems convoluted right now. Looks open to refactor

export interface IdentifierCaptureSubmitHandlers<TResult> {
  qr: (rawQRValue: string) => Promise<TResult>
  manual: (identifierType: "UIN" | "PCN", identifier: string) => Promise<TResult>
}

export async function submitIdentifierCapture<TResult>(
  request: IdentifierCaptureRequest,
  handlers: IdentifierCaptureSubmitHandlers<TResult>
): Promise<TResult> {
  if (request.kind === "qr") {
    return handlers.qr(request.rawQRValue)
  }

  return handlers.manual(request.identifierType, request.identifier)
}
