import { useState, type DragEvent, type ChangeEvent } from "react"
import { Loader2 } from "lucide-react"

interface FileUploadScannerProps {
  onFileSelect: (file: File) => void
  isLoading: boolean
}

export function FileUploadScanner({
  onFileSelect,
  isLoading,
}: FileUploadScannerProps) {
  const [isDragging, setIsDragging] = useState(false)

  const processFile = (file: File | undefined) => {
    if (!file || isLoading) {
      return
    }

    onFileSelect(file)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    processFile(file)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    processFile(file)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex w-full max-w-xl flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
    >
      <p className="mb-3 text-sm text-muted-foreground">
        Drag and drop a QR image here, or choose a file.
      </p>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
        <span>{isLoading ? "Processing..." : "Select Image"}</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </label>
    </div>
  )
}
