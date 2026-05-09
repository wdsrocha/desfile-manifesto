/**
 * Backfill slug for existing look documents.
 *
 * Generates `kebab(model.name)` for each look that lacks a slug.
 * Skips looks with no model name and prints a warning — those must be fixed
 * in Studio before running the script again.
 * Idempotent: looks that already have slug.current are skipped (setIfMissing).
 * Also processes draft documents so slugs stay consistent.
 *
 * Usage:
 *   tsx scripts/backfill-look-slugs.ts --dry-run
 *   tsx scripts/backfill-look-slugs.ts
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local (Editor permissions).
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

type LookDoc = {
  _id: string
  model?: { name?: string } | null
  slug?: { current?: string } | null
}

function toKebab(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  const looks = await client.fetch<LookDoc[]>(
    `*[_type == "look"] { _id, model, slug }`,
  )

  console.log(`Found ${looks.length} look document(s) (including drafts).`)

  const toBackfill = looks.filter((l) => !l.slug?.current)

  if (toBackfill.length === 0) {
    console.log('All looks already have a slug. Nothing to do.')
    return
  }

  console.log(`${toBackfill.length} look(s) need a slug — generating…\n`)

  const noName: LookDoc[] = []
  let backfilled = 0

  for (const look of toBackfill) {
    if (!look.model?.name) {
      noName.push(look)
      continue
    }
    const slug = toKebab(look.model.name)
    console.log(`  "${look.model.name}" (${look._id}) → ${slug}${dryRun ? ' (dry-run)' : ''}`)
    if (!dryRun) {
      await client
        .patch(look._id)
        .setIfMissing({ slug: { _type: 'slug', current: slug } })
        .commit()
    }
    backfilled++
  }

  if (noName.length > 0) {
    console.warn(`\n⚠ ${noName.length} look(s) skipped — no model name set:`)
    for (const look of noName) {
      console.warn(`  ${look._id}`)
    }
    console.warn('  → Fill in model.name in Studio, then re-run this script.')
  }

  console.log(
    `\nDone. backfilled=${backfilled}, skipped=${noName.length}${dryRun ? ' (dry-run, no writes)' : ''}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
