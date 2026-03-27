import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { checkRateLimit } from '@/lib/rateLimit'
import { createServiceClient } from '@/lib/supabase/service'

const BUCKET = 'event-images'
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])

// file-type is CommonJS (v16) — use require to avoid ESM interop issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fileTypeFromBuffer } = require('file-type')

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Rate limit ──────────────────────────────────────────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many upload requests. Please wait before trying again.' },
      { status: 429 }
    )
  }

  // ── Parse form data ─────────────────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }

  const file = formData.get('image')
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'No image file provided.' },
      { status: 400 }
    )
  }

  // ── Size check (hard server limit) ─────────────────────────────────────────
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'File exceeds the 5 MB limit.' },
      { status: 400 }
    )
  }

  // ── Read file into buffer ───────────────────────────────────────────────────
  const buffer = Buffer.from(await file.arrayBuffer())

  // ── MIME type validation via magic bytes ────────────────────────────────────
  // Do NOT trust file.type or the file extension — check actual bytes.
  const typeResult = await fileTypeFromBuffer(buffer.slice(0, 4100))
  const detectedMime = typeResult?.mime ?? ''

  if (!ALLOWED_MIMES.has(detectedMime)) {
    return NextResponse.json(
      {
        error:
          'Unsupported file type. Please upload a JPG, PNG, or WebP image.',
      },
      { status: 400 }
    )
  }

  // ── Process with sharp ──────────────────────────────────────────────────────
  let fullBuffer: Buffer
  let thumbBuffer: Buffer

  try {
    ;[fullBuffer, thumbBuffer] = await Promise.all([
      sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer(),
      sharp(buffer)
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer(),
    ])
  } catch {
    return NextResponse.json(
      { error: 'Image processing failed. Please try a different image.' },
      { status: 400 }
    )
  }

  // ── Upload to Supabase Storage ──────────────────────────────────────────────
  const uuid = crypto.randomUUID()
  const db = createServiceClient()
  const storage = db.storage.from(BUCKET)

  const [fullUpload, thumbUpload] = await Promise.all([
    storage.upload(`${uuid}-full.webp`, fullBuffer, {
      contentType: 'image/webp',
      upsert: false,
    }),
    storage.upload(`${uuid}-thumb.webp`, thumbBuffer, {
      contentType: 'image/webp',
      upsert: false,
    }),
  ])

  if (fullUpload.error || thumbUpload.error) {
    console.error('[upload] Supabase storage error:', fullUpload.error ?? thumbUpload.error)
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }

  // Build public CDN URLs
  const {
    data: { publicUrl: imageUrl },
  } = storage.getPublicUrl(`${uuid}-full.webp`)

  const {
    data: { publicUrl: imageThumbUrl },
  } = storage.getPublicUrl(`${uuid}-thumb.webp`)

  return NextResponse.json({ imageUrl, imageThumbUrl })
}
