import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import { readBarcodes, type ReaderOptions } from "zxing-wasm/reader"

const READER_OPTIONS: ReaderOptions = {
  tryHarder: true,
  formats: ["QRCode"],
  maxNumberOfSymbols: 1,
}

interface UseQRScannerOptions<TResult> {
  onDecode: (rawQRValue: string) => Promise<TResult>
  onScanError?: () => TResult
}

interface UseQRScannerResult<TResult> {
  videoRef: RefObject<HTMLVideoElement | null>
  startWebcamScan: () => void
  stopWebcamScan: () => void
  isScanning: boolean
  handleFileUpload: (file: File) => void
  scanResult: TResult | null
  isLoading: boolean
  reset: () => void
}

export function useQRScanner<TResult>({
  onDecode,
  onScanError,
}: UseQRScannerOptions<TResult>): UseQRScannerResult<TResult> {
  const videoRef = useRef<HTMLVideoElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const isProcessingRef = useRef(false)
  const activeObjectUrlRef = useRef<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [scanResult, setScanResult] = useState<TResult | null>(null)

  const emitScanError = useCallback(() => {
    if (!onScanError) return
    setScanResult(onScanError())
  }, [onScanError])

  const runDecodeAction = useCallback(async (rawQRValue: string) => {
    setIsLoading(true)
    try {
      const result = await onDecode(rawQRValue)
      setScanResult(result)
    } catch {
      emitScanError()
    } finally {
      setIsLoading(false)
    }
  }, [emitScanError, onDecode])

  const stopWebcamScan = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    isProcessingRef.current = false
    setIsScanning(false)
  }, [])

  const startWebcamScan = useCallback(() => {
    if (isScanning || isLoading) return
    if (!videoRef.current) return

    setScanResult(null)
    isProcessingRef.current = false
    setIsScanning(true)

    const video = videoRef.current

    // Request camera stream and attach to video element
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        video.srcObject = stream
        // Store stream ref for cleanup
        streamRef.current = stream
        return video.play()
      })
      .then(() => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          emitScanError()
          stopWebcamScan()
          return
        }

        const tick = async () => {
          if (!videoRef.current || isProcessingRef.current) {
            animFrameRef.current = requestAnimationFrame(tick)
            return
          }

          if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            animFrameRef.current = requestAnimationFrame(tick)
            return
          }

          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

          try {
            const results = await readBarcodes(imageData, READER_OPTIONS)
            const [first] = results
            if (first?.text) {
              isProcessingRef.current = true
              await runDecodeAction(first.text)
              stopWebcamScan()
              return
            }
          } catch {
            // No QR in this frame, continue
          }

          animFrameRef.current = requestAnimationFrame(tick)
        }

        animFrameRef.current = requestAnimationFrame(tick)
      })
      .catch(() => {
        emitScanError()
        stopWebcamScan()
      })
  }, [emitScanError, isLoading, isScanning, runDecodeAction, stopWebcamScan])

  const revokeObjectUrl = useCallback(() => {
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current)
      activeObjectUrlRef.current = null
    }
  }, [])

  const handleFileUpload = useCallback((file: File) => {
    if (isLoading || isScanning) return

    setScanResult(null)
    revokeObjectUrl()
    setIsLoading(true)

    void (async () => {
      try {
        // Try direct file decode first — zxing-wasm handles this natively
        const results = await readBarcodes(file, READER_OPTIONS)

        if (results.length > 0 && results[0].text) {
          await runDecodeAction(results[0].text)
          return
        }

        // Fallback: canvas preprocessing for dense/large QR codes
        const objectUrl = URL.createObjectURL(file)
        activeObjectUrlRef.current = objectUrl

        await new Promise<void>((resolve, reject) => {
          const img = new Image()

          img.onerror = () => reject(new Error("Image load failed"))

          img.onload = async () => {
            try {
              const canvas = document.createElement("canvas")
              const ctx = canvas.getContext("2d")

              if (!ctx) {
                reject(new Error("Canvas context unavailable"))
                return
              }

              const upscale = 2
              const padding = 100

              canvas.width = img.naturalWidth * upscale + padding * 2
              canvas.height = img.naturalHeight * upscale + padding * 2

              ctx.imageSmoothingEnabled = false
              ctx.fillStyle = "white"
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              ctx.drawImage(img, padding, padding, img.naturalWidth * upscale, img.naturalHeight * upscale)

              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
              const fallbackResults = await readBarcodes(imageData, READER_OPTIONS)

              if (fallbackResults.length > 0 && fallbackResults[0].text) {
                await runDecodeAction(fallbackResults[0].text)
                resolve()
              } else {
                reject(new Error("No QR found after preprocessing"))
              }
            } catch (err) {
              reject(err)
            }
          }

          img.src = objectUrl
        })
      } catch {
        emitScanError()
      } finally {
        revokeObjectUrl()
        setIsLoading(false)
      }
    })()
  }, [emitScanError, isLoading, isScanning, revokeObjectUrl, runDecodeAction])

  const reset = useCallback(() => {
    stopWebcamScan()
    revokeObjectUrl()
    setScanResult(null)
    setIsLoading(false)
  }, [revokeObjectUrl, stopWebcamScan])

  useEffect(() => {
    return () => {
      stopWebcamScan()
      revokeObjectUrl()
    }
  }, [revokeObjectUrl, stopWebcamScan])

  return {
    videoRef,
    startWebcamScan,
    stopWebcamScan,
    isScanning,
    handleFileUpload,
    scanResult,
    isLoading,
    reset,
  }
}