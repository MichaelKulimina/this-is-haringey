'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Image from 'next/image'

interface UploadedUrls {
  imageUrl: string
  imageThumbUrl: string
}

interface ImageUploaderProps {
  onUploadComplete: (urls: UploadedUrls) => void
  onClear: () => void
}

type UploaderState = 'idle' | 'selected' | 'uploading' | 'done' | 'error'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ImageUploader({ onUploadComplete, onClear }: ImageUploaderProps) {
  const [state, setState] = useState<UploaderState>('idle')
  const [src, setSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── File validation ─────────────────────────────────────────────────────────
  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, or WebP image.'
    }
    if (file.size > MAX_BYTES) {
      return 'File must be under 5 MB.'
    }
    return null
  }

  // ── File selection ──────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setState('error')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setSrc(e.target?.result as string)
      setState('selected')
      // Default crop: full 16:9
      setCrop(undefined)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // ── Crop → Canvas → Upload ──────────────────────────────────────────────────
  async function handleCropAndUpload() {
    if (!imgRef.current || !src) return
    setState('uploading')
    setError(null)

    let blob: Blob

    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
      // Produce cropped blob from canvas
      const canvas = document.createElement('canvas')
      const img = imgRef.current
      const scaleX = img.naturalWidth / img.width
      const scaleY = img.naturalHeight / img.height

      canvas.width = completedCrop.width * scaleX
      canvas.height = completedCrop.height * scaleY

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setState('error')
        setError('Canvas not supported in this browser.')
        return
      }

      ctx.drawImage(
        img,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      )

      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
          'image/jpeg',
          0.92
        )
      })
    } else {
      // No crop applied — use the original file
      const response = await fetch(src)
      blob = await response.blob()
    }

    const formData = new FormData()
    formData.append('image', blob, 'image.jpg')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error ?? 'Upload failed.')
      }

      setPreview(json.imageThumbUrl)
      setState('done')
      onUploadComplete({ imageUrl: json.imageUrl, imageThumbUrl: json.imageThumbUrl })
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    }
  }

  // ── Clear ───────────────────────────────────────────────────────────────────
  function handleClear() {
    setState('idle')
    setSrc(null)
    setCrop(undefined)
    setCompletedCrop(null)
    setPreview(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onClear()
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (state === 'done' && preview) {
    return (
      <div className="flex items-start gap-4 p-4 bg-surface border border-border rounded-md">
        <Image
          src={preview}
          alt="Event image preview"
          width={120}
          height={68}
          className="rounded object-cover"
          style={{ aspectRatio: '16/9' }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Image uploaded ✓</p>
          <p className="text-xs text-muted mt-0.5">
            Processed and optimised automatically
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-sm text-muted hover:text-foreground transition-colors shrink-0"
        >
          Remove
        </button>
      </div>
    )
  }

  if (state === 'selected' && src) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">
          Drag the handles to crop to a 16:9 ratio, or click{' '}
          <strong>Crop &amp; Upload</strong> to use the image as-is.
        </p>
        <div className="max-w-full overflow-hidden rounded-md border border-border">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={16 / 9}
            className="max-w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="Preview"
              style={{ maxWidth: '100%', display: 'block' }}
            />
          </ReactCrop>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCropAndUpload}
            className="px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Crop &amp; Upload
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 rounded-md border border-border text-sm text-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  if (state === 'uploading') {
    return (
      <div className="flex items-center gap-3 p-4 bg-surface border border-border rounded-md">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted">Uploading and processing image…</p>
      </div>
    )
  }

  // Idle / error state — drop zone
  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          'relative flex flex-col items-center justify-center gap-2',
          'border-2 border-dashed rounded-md p-8 cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-[#FDF5F1]'
            : 'border-border hover:border-primary hover:bg-[#FDF5F1]',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
        />
        {/* Upload icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-sm font-medium text-foreground">
          Drag &amp; drop or <span className="text-primary underline">browse files</span>
        </p>
        <p className="text-xs text-muted text-center">JPG, PNG or WebP · Max 5 MB · 16:9 recommended</p>
        <p className="text-xs font-medium text-primary mt-1">
          Listings with images receive significantly more clicks
        </p>
      </div>
      {(state === 'error' || error) && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
