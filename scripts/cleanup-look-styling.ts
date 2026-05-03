/**
 * One-shot cleanup: unset the legacy `styling` field from all look documents.
 *
 * Usage:
 *   tsx scripts/cleanup-look-styling.ts --dry-run
 *   tsx scripts/cleanup-look-styling.ts
 *
 * Idempotent: documents without a `styling` field are skipped.
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

type LookDoc = { _id: string; lookNumber?: string | null; styling?: unknown }

async function main() {
  const looks = await client.fetch<LookDoc[]>(
    `*[_type == "look"]{ _id, lookNumber, styling }`,
  )

  console.log(`Found ${looks.length} look document(s).`)

  const toClean = looks.filter((l) => l.styling != null)

  if (toClean.length === 0) {
    console.log('No documents with styling field. Nothing to do.')
    return
  }

  console.log(`${toClean.length} document(s) have styling — unsetting…\n`)

  for (const look of toClean) {
    const label = `Look ${look.lookNumber ?? '?'} (${look._id})`
    console.log(`  - ${label}${dryRun ? ' (dry-run)' : ''}`)
    if (!dryRun) {
      await client.patch(look._id).unset(['styling']).commit()
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
