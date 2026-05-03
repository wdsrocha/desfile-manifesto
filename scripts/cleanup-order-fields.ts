/**
 * One-shot cleanup: unset the legacy `order` field from all documents of
 * types creditGroup, pieceType, person, and brand.
 *
 * Run this AFTER confirming that:
 *   1. The `order` field has been removed from all affected schemas.
 *   2. GROQ queries for these types use lexicographic ordering.
 *   3. The Studio no longer shows an "Ordem" field for any of these types.
 *
 * Usage:
 *   tsx scripts/cleanup-order-fields.ts --dry-run
 *   tsx scripts/cleanup-order-fields.ts
 *
 * Idempotent: documents without an `order` field are skipped.
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

type Doc = { _id: string; _type: string; order?: unknown }

const TYPES = ['creditGroup', 'pieceType', 'person', 'brand'] as const

async function main() {
  const docs = await client.fetch<Doc[]>(
    `*[_type in ["creditGroup", "pieceType", "person", "brand"]]{ _id, _type, order }`,
  )

  console.log(`Found ${docs.length} document(s) across affected types.`)

  const toClean = docs.filter((d) => d.order != null)

  if (toClean.length === 0) {
    console.log('No documents with order field. Nothing to do.')
    return
  }

  console.log(`${toClean.length} document(s) have order — unsetting…\n`)

  for (const type of TYPES) {
    const typeDocs = toClean.filter((d) => d._type === type)
    if (typeDocs.length === 0) continue
    console.log(`  ${type}: ${typeDocs.length} document(s)`)
    for (const doc of typeDocs) {
      console.log(`    - ${doc._id}${dryRun ? ' (dry-run)' : ''}`)
      if (!dryRun) {
        await client.patch(doc._id).unset(['order']).commit()
      }
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
