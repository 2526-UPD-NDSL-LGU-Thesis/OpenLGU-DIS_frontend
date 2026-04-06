import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from "@zxing/browser"
import { NotFoundException } from "@zxing/library"

import { verifyQR } from "../services/verificationService"
import type { VerificationResult } from "../types/verification"

interface UseQRScannerResult {
  videoRef: RefObject<HTMLVideoElement | null>
  startWebcamScan: () => void
  stopWebcamScan: () => void
  isScanning: boolean
  handleFileUpload: (file: File) => void
  verificationResult: VerificationResult | null
  isLoading: boolean
  reset: () => void
}

export function useQRScanner(): UseQRScannerResult {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const isProcessingRef = useRef(false)
  const activeObjectUrlRef = useRef<string | null>(null)

  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null)

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

  const stopWebcamScan = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null

    isProcessingRef.current = false
    setIsScanning(false)
  }, [])

  const runVerification = useCallback(async (rawQRValue: string) => {
    setIsLoading(true)

    try {
      const result = await verifyQR(rawQRValue)
      console.log(result)
      setVerificationResult(result)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startWebcamScan = useCallback(() => {
    if (isScanning || isLoading) {
      return
    }

    setVerificationResult(null)
    setIsScanning(true)
    isProcessingRef.current = false

    const reader = getReader()
    void reader
      .decodeFromVideoDevice(
        undefined,
        videoRef.current ?? undefined,
        (result, error, controls) => {
          controlsRef.current = controls

          if (result && !isProcessingRef.current) {
            isProcessingRef.current = true

            void (async () => {
              await runVerification(result.getText())
              stopWebcamScan()
            })()

            return
          }

          if (error && !(error instanceof NotFoundException) && !isProcessingRef.current) {
            // TODO: Refine fallback mapping once backend provides machine-readable error codes.
            setVerificationResult({ status: "error_tampered" })
            stopWebcamScan()
          }
        }
      )
      .catch(() => {
        // TODO: Refine fallback mapping once backend provides machine-readable error codes.
        setVerificationResult({ status: "error_tampered" })
        stopWebcamScan()
      })
  }, [getReader, isLoading, isScanning, runVerification, stopWebcamScan])

  const handleFileUpload = useCallback(
    (file: File) => {
      if (isLoading || isScanning) {
        return
      }

      setVerificationResult(null)
      revokeObjectUrl()

      const objectUrl = URL.createObjectURL(file)
      activeObjectUrlRef.current = objectUrl

      const reader = getReader()
      setIsLoading(true)

      void reader
        .decodeFromImageUrl(objectUrl)
        .then(async (result) => {
          await runVerification(result.getText())
        })
        .catch(() => {
          // TODO: Refine fallback mapping once backend provides machine-readable error codes.
          setVerificationResult({ status: "error_tampered" })
        })
        .finally(() => {
          revokeObjectUrl()
          setIsLoading(false)
        })
    },
    [getReader, isLoading, isScanning, revokeObjectUrl, runVerification]
  )

  const reset = useCallback(() => {
    stopWebcamScan()
    revokeObjectUrl()
    setVerificationResult(null)
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
    verificationResult,
    isLoading,
    reset,
  }
}
