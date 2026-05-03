/**
 * One-shot cleanup: unset the legacy `lookNumber` field from all look documents.
 *
 * Run this AFTER confirming that:
 *   1. All looks have a valid orderRank (seed-order-rank-looks.ts ran successfully).
 *   2. The GROQ query uses order(orderRank asc) and the site renders correctly.
 *   3. The Studio drag-and-drop list works as expected.
 *
 * Usage:
 *   tsx scripts/cleanup-look-look-number.ts --dry-run
 *   tsx scripts/cleanup-look-look-number.ts
 *
 * Idempotent: documents without a lookNumber field are skipped.
 * Operates on both published and draft documents (perspective: raw).
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

type LookDoc = { _id: string; lookNumber?: unknown }

async function main() {
  const looks = await client.fetch<LookDoc[]>(
    `*[_type == "look"]{ _id, lookNumber }`,
  )

  console.log(`Found ${looks.length} look document(s).`)

  const toClean = looks.filter((l) => l.lookNumber != null)

  if (toClean.length === 0) {
    console.log('No documents with lookNumber field. Nothing to do.')
    return
  }

  console.log(`${toClean.length} document(s) have lookNumber — unsetting…\n`)

  for (const look of toClean) {
    console.log(`  - ${look._id}${dryRun ? ' (dry-run)' : ''}`)
    if (!dryRun) {
      await client.patch(look._id).unset(['lookNumber']).commit()
    }
  }

  console.log(
    `\nDone. cleaned=${toClean.length}${dryRun ? ' (dry-run, no writes)' : ''}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
