/**
 * seed-event-images.ts
 *
 * Fetches real Haringey borough photos from Wikimedia Commons and
 * uploads them to Supabase Storage, then updates the events table.
 *
 * Mirrors the production upload pipeline exactly:
 *   full  → {uuid}-full.webp  (1200px wide, WebP quality 82)
 *   thumb → {uuid}-thumb.webp  (400px wide,  WebP quality 82)
 *
 * Run:
 *   npx tsx scripts/seed-event-images.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

// ── Load .env.local ─────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), '.env.local')
const envLines = readFileSync(envPath, 'utf-8').split('\n')
for (const line of envLines) {
  const match = line.match(/^([^#\s][^=]*)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET       = 'event-images'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Events to seed ───────────────────────────────────────────────────────────
// Real Haringey borough photos from Wikimedia Commons (CC-licensed).
const EVENTS = [
  {
    id:       'cc00e33f-f0fa-422b-8d35-c1a6212e0926',
    name:     'Open Studio Weekend — Tottenham Artists',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Mural_outside_Coombes_Croft_Library%2C_Tottenham_-_geograph.org.uk_-_2191900.jpg',
  },
  {
    id:       '43a32f05-a09b-4a1a-9a69-e7b6b7ac1182',
    name:     'Jazz at The Boogaloo',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Murals%2C_Boogaloo_Club%2C_Archway_Road_-_geograph.org.uk_-_2208990.jpg',
  },
  {
    id:       '5369e588-48e5-41ab-81fe-b2e4809b5dae',
    name:     'Wood Green Street Food Market',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Wood_Green_market_stalls%2C_Dovecote_Avenue_-_1.jpg',
  },
  {
    id:       '9bda01c1-4b42-4dd0-a5b5-2b828c786ea8',
    name:     'Hornsey Literary Festival — Opening Night',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Square_outside_Hornsey_Town_Hall%2C_London_N8_-_geograph.org.uk_-_4464260.jpg',
  },
  {
    id:       '18cebfd8-1f22-4453-91c7-1112a8eccd71',
    name:     'Bruce Grove Neighbours Litter Pick',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Bruce_Grove_Station_forecourt.jpg',
  },
  {
    id:       '7c6192cb-22f7-4b71-a68e-298c311ffaeb',
    name:     'Grime and Garage: Haringey Roots',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Mural_on_Markfield_Road%2C_Tottenham_Hale_-_geograph.org.uk_-_7779863.jpg',
  },
  {
    id:       'c3dab747-6ae7-4979-a8ef-36bf216cac01',
    name:     'Haringey Heritage Walk: Seven Sisters to Bruce Grove',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/High_Road_Tottenham_-_view_from_Bruce_Grove_Station.jpg',
  },
  {
    id:       'eddc97d9-2f9d-41ef-8a2f-c293c40ae45d',
    name:     'Muswell Hill Farmers Market',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Muswell_Hill_-_geograph.org.uk_-_2143973.jpg',
  },
  {
    id:       '3a2affea-c6cc-4d6b-b900-a7958650b8aa',
    name:     'Life Drawing at Sunny Jar',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Spriggan_sculpture_by_Marilyn_Collins%2C_Parkland_Walk%2C_Haringey.jpg',
  },
  {
    id:       '199d6dc8-a370-4da8-b390-46b6d6c71897',
    name:     'Stroud Green Summer Fete',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Mountview_Road%2C_Stroud_Green_-_geograph.org.uk_-_2806983.jpg',
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
async function fetchImage(imageUrl: string): Promise<Buffer> {
  const res = await fetch(imageUrl, {
    redirect: 'follow',
    headers: { 'User-Agent': 'ThisIsHaringey/1.0 (hello@thisisharingey.co.uk)' },
  })
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status} ${imageUrl}`)
  return Buffer.from(await res.arrayBuffer())
}

async function processImages(raw: Buffer): Promise<{ full: Buffer; thumb: Buffer }> {
  const [full, thumb] = await Promise.all([
    sharp(raw).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
    sharp(raw).resize({ width: 400,  withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
  ])
  return { full, thumb }
}

async function uploadAndUpdate(event: typeof EVENTS[0]): Promise<void> {
  console.log(`\n→ ${event.name}`)

  // Fetch photo from Wikimedia Commons
  process.stdout.write('  Fetching image…')
  const raw = await fetchImage(event.imageUrl)
  console.log(' done')

  // Process with sharp (mirrors upload API)
  process.stdout.write('  Processing with sharp…')
  const { full, thumb } = await processImages(raw)
  console.log(' done')

  // Generate a UUID for the storage paths
  const uuid = crypto.randomUUID()
  const storage = db.storage.from(BUCKET)

  // Upload both variants
  process.stdout.write('  Uploading to Supabase Storage…')
  const [fullUpload, thumbUpload] = await Promise.all([
    storage.upload(`${uuid}-full.webp`,  full,  { contentType: 'image/webp', upsert: true }),
    storage.upload(`${uuid}-thumb.webp`, thumb, { contentType: 'image/webp', upsert: true }),
  ])

  if (fullUpload.error)  throw new Error(`Full upload failed: ${fullUpload.error.message}`)
  if (thumbUpload.error) throw new Error(`Thumb upload failed: ${thumbUpload.error.message}`)
  console.log(' done')

  // Build public URLs
  const { data: { publicUrl: imageUrl } }      = storage.getPublicUrl(`${uuid}-full.webp`)
  const { data: { publicUrl: imageThumbUrl } } = storage.getPublicUrl(`${uuid}-thumb.webp`)

  // Update events table
  process.stdout.write('  Updating database…')
  const { error: dbError } = await db
    .from('events')
    .update({ image_url: imageUrl, image_thumb_url: imageThumbUrl })
    .eq('id', event.id)

  if (dbError) throw new Error(`DB update failed: ${dbError.message}`)
  console.log(' done')
  console.log(`  ✓  ${imageThumbUrl}`)
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Seeding Haringey images for ${EVENTS.length} events…`)
  for (const event of EVENTS) {
    await uploadAndUpdate(event)
  }
  console.log('\n✅  All done.')
}

main().catch((err) => {
  console.error('\n❌ ', err.message)
  process.exit(1)
})
