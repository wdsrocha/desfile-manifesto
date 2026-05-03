/**
 * Idempotent seed: creates the initial pieceType documents if they don't
 * already exist. Match is by exact `name` (case-sensitive).
 *
 * Usage:
 *   tsx scripts/seed-piece-types.ts --dry-run
 *   tsx scripts/seed-piece-types.ts
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
})

const SEED: { name: string; order: number }[] = [
  { name: 'Camisa', order: 1 },
  { name: 'Bermuda', order: 2 },
  { name: 'Colar', order: 3 },
  { name: 'Chapéu', order: 4 },
]

type PieceTypeDoc = { _id: string; name: string; order?: number }

async function main() {
  const existing = await client.fetch<PieceTypeDoc[]>(
    `*[_type == "pieceType"]{ _id, name, order }`,
  )

  console.log(`Found ${existing.length} existing pieceType document(s).`)

  const existingNames = new Set(existing.map((d) => d.name))

  let created = 0
  let skipped = 0

  for (const seed of SEED) {
    if (existingNames.has(seed.name)) {
      console.log(`  - "${seed.name}": already exists, skip`)
      skipped++
      continue
    }

    console.log(
      `  + creating pieceType "${seed.name}" (order: ${seed.order})${dryRun ? ' (dry-run)' : ''}`,
    )

    if (!dryRun) {
      await client.create({ _type: 'pieceType', name: seed.name, order: seed.order })
    }
    created++
  }

  console.log(
    `\nDone. created=${created} skipped=${skipped}${dryRun ? ' (dry-run, no writes)' : ''}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
