/**
 * One-shot migration: move legacy `look.image` into `look.images[0]`.
 *
 * Usage:
 *   tsx scripts/migrate-look-images.ts --dry-run
 *   tsx scripts/migrate-look-images.ts
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local (token with Editor permissions).
 * Idempotent: skips documents that already have a non-empty `images` array.
 * Operates on both published and draft documents.
 */

import { createClient } from '@sanity/client'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'

loadEnv({ path: resolve(process.cwd(), '.env.local') })

const dryRun = process.argv.includes('--dry-run')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET')
}
if (!token) {
  throw new Error('Missing SANITY_API_WRITE_TOKEN in .env.local')
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: 'raw',
})

type LegacyLook = {
  _id: string
  _rev: string
  image?: {
    _type?: 'image'
    asset?: { _ref?: string; _type?: string }
    alt?: string
    hotspot?: unknown
    crop?: unknown
  }
  images?: unknown[]
}

async function main() {
  const looks = await client.fetch<LegacyLook[]>(
    `*[_type == "look"]{ _id, _rev, image, images }`,
  )

  console.log(`Found ${looks.length} look documents (published + drafts).`)

  let migrated = 0
  let skipped = 0

  for (const look of looks) {
    const hasImages = Array.isArray(look.images) && look.images.length > 0
    if (hasImages) {
      skipped++
      console.log(`  - ${look._id}: already has images[], skip`)
      continue
    }

    if (!look.image?.asset?._ref) {
      skipped++
      console.log(`  - ${look._id}: no legacy image to migrate, skip`)
      continue
    }

    const newImage = {
      _key: cryptoKey(),
      _type: 'image' as const,
      asset: look.image.asset,
      ...(look.image.hotspot ? { hotspot: look.image.hotspot } : {}),
      ...(look.image.crop ? { crop: look.image.crop } : {}),
      ...(look.image.alt ? { alt: look.image.alt } : {}),
    }

    console.log(
      `  - ${look._id}: migrating image -> images[0]${dryRun ? ' (dry-run)' : ''}`,
    )

    if (!dryRun) {
      await client
        .patch(look._id)
        .set({ images: [newImage] })
        .unset(['image'])
        .commit({ autoGenerateArrayKeys: true })
    }
    migrated++
  }

  console.log(
    `\nDone. migrated=${migrated} skipped=${skipped}${dryRun ? ' (dry-run, no writes)' : ''}`,
  )
}

function cryptoKey() {
  return Math.random().toString(36).slice(2, 14)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
