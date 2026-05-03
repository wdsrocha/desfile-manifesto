/**
 * Migration: converts look.pieces[].slot from reference<pieceType> to string.
 *
 * Run this once after deploying the schema change that replaced the
 * reference field with a plain string field.
 *
 * Usage:
 *   tsx scripts/migrate-pieces-slot-to-string.ts [--dry-run]
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local (Editor permissions).
 */

import { createClient } from '@sanity/client'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'

loadEnv({ path: resolve(process.cwd(), '.env.local') })

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

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

type PieceTypeDoc = { _id: string; name: string }
type RawPiece = {
  _key: string
  _type: string
  slot?: { _type: string; _ref: string } | string | null
  brands?: { _key: string; _type: string; _ref: string }[]
}
type LookDoc = { _id: string; model?: { name?: string | null } | null; pieces?: RawPiece[] }

async function main() {
  const [pieceTypes, looks] = await Promise.all([
    client.fetch<PieceTypeDoc[]>(`*[_type == "pieceType"]{ _id, name }`),
    client.fetch<LookDoc[]>(`*[_type == "look"]{ _id, model { name }, pieces[] }`),
  ])

  console.log(`Loaded: ${pieceTypes.length} pieceType(s), ${looks.length} look(s).`)

  const pieceTypeById = new Map(pieceTypes.map((pt) => [pt._id, pt.name]))

  let patchCount = 0

  for (const look of looks) {
    if (!look.pieces || look.pieces.length === 0) continue

    const needsMigration = look.pieces.some(
      (p) => p.slot != null && typeof p.slot === 'object' && '_ref' in p.slot,
    )
    if (!needsMigration) continue

    const migratedPieces = look.pieces.map((p) => {
      if (p.slot == null || typeof p.slot === 'string') return p
      const ref = (p.slot as { _ref: string })._ref
      const name = pieceTypeById.get(ref)
      if (!name) {
        throw new Error(
          `Look "${look._id}": slot ref "${ref}" not found in pieceType documents. ` +
            `Delete the orphaned piece or restore the pieceType before migrating.`,
        )
      }
      return { ...p, slot: name }
    })

    const label = look.model?.name ?? look._id
    console.log(`  ${dryRun ? '[dry-run] ' : ''}Look "${label}" (${look._id}): migrating ${look.pieces.length} piece(s)`)

    if (!dryRun) {
      await client.patch(look._id).set({ pieces: migratedPieces }).commit()
    }

    patchCount++
  }

  if (patchCount === 0) {
    console.log('Nothing to migrate — all slots are already strings.')
    return
  }

  console.log(`\n${dryRun ? 'Dry-run complete' : 'Done'}. ${patchCount} look(s) ${dryRun ? 'would be' : 'were'} patched.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
