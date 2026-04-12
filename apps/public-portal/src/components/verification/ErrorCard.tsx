import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@openlguid/ui/components/alert"

interface ErrorCardProps {
  status: "error_tampered" | "error_not_registered" | "random_qr"
}

export function ErrorCard({ status }: ErrorCardProps) {
  if (status === "error_tampered") {
    return (
      <Alert variant="destructive" className="w-full max-w-2xl">
        <AlertTitle>Invalid QR Code</AlertTitle>
        <AlertDescription>
          This QR code appears to have been tampered with.
        </AlertDescription>
      </Alert>
    )
  }
  else if (status === "random_qr"){
    return (
      <Alert variant="destructive" className="w-full max-w-2xl">
        <AlertTitle>Invalid QR Code</AlertTitle>
        <AlertDescription>
          This is not an LGU or National ID QR code.
        </AlertDescription>
      </Alert>
    )
  }
  else if (status === "error_not_registered"){
    <Alert variant="destructive" className="w-full max-w-2xl">
      <AlertTitle>Resident Not Found</AlertTitle>
      <AlertDescription>
        This National ID belongs to someone who is not registered in the LGU's
        system.
      </AlertDescription>
    </Alert> 
  }

  return (
    <Alert variant="destructive" className="w-full max-w-2xl">
      <AlertTitle>Fatal Error</AlertTitle>
      <AlertDescription>
        You should not be seeing this! We seriously messed up.
      </AlertDescription>
    </Alert>
  )
}
