/**
 * Seed orderRank for existing look documents.
 *
 * Assigns LexoRank values to looks that do not yet have an orderRank,
 * preserving the legacy lookNumber order (ascending) so the drag-and-drop
 * list starts in the same order Wesley had before.
 *
 * Idempotent: looks that already have an orderRank are skipped (setIfMissing).
 *
 * Usage:
 *   tsx scripts/seed-order-rank-looks.ts --dry-run
 *   tsx scripts/seed-order-rank-looks.ts
 *
 * Run this BEFORE switching the GROQ query to order(orderRank asc).
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local (Editor permissions).
 */

import { createClient } from '@sanity/client'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
import { LexoRank } from 'lexorank'

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
  lookNumber?: string | null
  orderRank?: string | null
}

async function main() {
  // Load all looks ordered by legacy lookNumber asc (falls back to _id for looks without one)
  const looks = await client.fetch<LookDoc[]>(
    `*[_type == "look"] | order(lookNumber asc, _id asc) { _id, lookNumber, orderRank }`,
  )

  console.log(`Found ${looks.length} look document(s).`)

  const toSeed = looks.filter((l) => !l.orderRank)

  if (toSeed.length === 0) {
    console.log('All looks already have orderRank. Nothing to do.')
    return
  }

  console.log(`${toSeed.length} look(s) need orderRank — generating ranks…\n`)

  // Generate sequential LexoRank values starting from a sensibly low rank
  let rank = LexoRank.middle()
  const assignments: { look: LookDoc; rank: string }[] = []

  for (const look of toSeed) {
    assignments.push({ look, rank: rank.toString() })
    rank = rank.genNext()
  }

  for (const { look, rank: rankValue } of assignments) {
    const label = look.lookNumber
      ? `Look ${look.lookNumber} (${look._id})`
      : `Look (${look._id})`
    console.log(`  ${label} → orderRank: ${rankValue}${dryRun ? ' (dry-run)' : ''}`)
    if (!dryRun) {
      await client.patch(look._id).setIfMissing({ orderRank: rankValue }).commit()
    }
  }

  console.log(
    `\nDone. seeded=${assignments.length}${dryRun ? ' (dry-run, no writes)' : ''}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
