import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@openlgu-dis/ui/components/alert"

interface ErrorCardProps {
  status: "error_tampered" | "error_not_registered"
}

export function ErrorCard({ status }: ErrorCardProps) {
  if (status === "error_tampered") {
    return (
      <Alert variant="destructive" className="w-full max-w-2xl">
        <AlertTitle>Invalid QR Code</AlertTitle>
        <AlertDescription>
          This QR code appears to have been tampered with or is not a valid LGU
          or National ID QR code.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive" className="w-full max-w-2xl">
      <AlertTitle>Resident Not Found</AlertTitle>
      <AlertDescription>
        This National ID belongs to someone who is not registered in the LGU's
        system.
      </AlertDescription>
    </Alert>
  )
}
