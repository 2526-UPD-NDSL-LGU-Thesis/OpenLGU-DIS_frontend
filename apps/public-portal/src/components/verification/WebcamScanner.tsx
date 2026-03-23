import type { RefObject } from "react"

import { Button } from "@openlgu-dis/ui/components/button"

interface WebcamScannerProps {
  videoRef: RefObject<HTMLVideoElement | null>
  isScanning: boolean
  onStart: () => void
  onStop: () => void
}

export function WebcamScanner({
  videoRef,
  isScanning,
  onStart,
  onStop,
}: WebcamScannerProps) {
  return (
    <div className="space-y-4">
      <video
        ref={videoRef}
        autoPlay
        muted
        className={`w-full max-w-xl rounded-xl border bg-black/5 object-cover aspect-[4/3] ${isScanning ? "block" : "hidden"}`}
      />

      {isScanning ? (
        <Button type="button" variant="outline" onClick={onStop}>
          Stop
        </Button>
      ) : (
        <Button type="button" onClick={onStart}>
          Start Scanning
        </Button>
      )}
    </div>
  )
}
