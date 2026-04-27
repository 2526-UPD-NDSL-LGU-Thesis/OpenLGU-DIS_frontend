// TODO need to review this

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from "@zxing/browser"
import { NotFoundException } from "@zxing/library"

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
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const isProcessingRef = useRef(false)
  const isStartingRef = useRef(false)
  const activeObjectUrlRef = useRef<string | null>(null)

  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [scanResult, setScanResult] = useState<TResult | null>(null)

  const getReader = useCallback((): BrowserMultiFormatReader => {
    if (!readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader()
    }

    return readerRef.current
  }, [])

  const revokeObjectUrl = useCallback(() => {
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current)
      activeObjectUrlRef.current = null
    }
  }, [])

  const emitScanError = useCallback(() => {
    if (!onScanError) {
      return
    }

    setScanResult(onScanError())
  }, [onScanError])

  const stopWebcamScan = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null

    isProcessingRef.current = false
    isStartingRef.current = false
    setIsScanning(false)
  }, [])

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

  const startWebcamScan = useCallback(() => {
    if (isScanning || isLoading || isStartingRef.current || controlsRef.current) {
      return
    }

    if (!videoRef.current) {
      return
    }

    setScanResult(null)
    setIsScanning(true)
    isProcessingRef.current = false
    isStartingRef.current = true

    const reader = getReader()
    void reader
      .decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error, controls) => {
          isStartingRef.current = false
          controlsRef.current = controls

          if (result && !isProcessingRef.current) {
            isProcessingRef.current = true

            void (async () => {
              await runDecodeAction(result.getText())
              stopWebcamScan()
            })()

            return
          }

          if (error && !(error instanceof NotFoundException) && !isProcessingRef.current) {
            emitScanError()
            stopWebcamScan()
          }
        }
      )
      .catch(() => {
        isStartingRef.current = false
        emitScanError()
        stopWebcamScan()
      })
  }, [emitScanError, getReader, isLoading, isScanning, runDecodeAction, stopWebcamScan])

  const handleFileUpload = useCallback(
    (file: File) => {
      if (isLoading || isScanning) {
        return
      }

      setScanResult(null)
      revokeObjectUrl()

      const objectUrl = URL.createObjectURL(file)
      activeObjectUrlRef.current = objectUrl

      const reader = getReader()
      setIsLoading(true)

      void reader
        .decodeFromImageUrl(objectUrl)
        .then(async (result) => {
          await runDecodeAction(result.getText())
        })
        .catch(() => {
          emitScanError()
        })
        .finally(() => {
          revokeObjectUrl()
          setIsLoading(false)
        })
    },
    [emitScanError, getReader, isLoading, isScanning, revokeObjectUrl, runDecodeAction]
  )

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
