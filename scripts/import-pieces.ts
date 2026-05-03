/**
 * Importer: reads a CSV of look pieces, resolves pieceType and brand
 * references, and patches look.pieces (full replacement per look).
 *
 * ⚠️  This script REPLACES look.pieces entirely for each look in the CSV.
 *     Any manual edits made in the Studio will be overwritten. Back up the
 *     dataset before running against production.
 *
 * Usage:
 *   tsx scripts/import-pieces.ts <path-to-csv> [--dry-run]
 *
 * CSV format (header row required):
 *   lookNumber,slot,brands[,target]
 *   01,Camisa,Melanina AM
 *   01,Bermuda,Ateliê 1970
 *   01,Colar,"Ateliê Fernanda Menezes"
 *   02,Camisa,"Brand A, Brand B"
 *
 * Columns:
 *   lookNumber  – matches look.lookNumber (string, e.g. "01")
 *   slot        – matches pieceType.name (case-insensitive, accent-insensitive)
 *   brands      – comma-separated list of brand names; use quotes if a name
 *                 contains a comma. Each entry matches brand.name or
 *                 brand.instagram (substring, case-insensitive, accent-insensitive).
 *   target      – optional: "published" | "draft". If omitted, patches both
 *                 (perspective raw).
 *
 * Behavior:
 *   - All CSV rows are resolved in memory before any patch is applied.
 *   - Any unresolved slot, brand, or lookNumber causes exit 1 with a clear
 *     error message. No partial patches.
 *   - Ambiguous brand match (>1 candidate) is also a fatal error.
 *   - --dry-run prints the proposed pieces per look; no writes.
 *   - Idempotent: re-running with the same CSV produces the same state.
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local (Editor permissions).
 */

import { createClient } from '@sanity/client'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { parse as parseCsv } from 'csv-parse/sync'

loadEnv({ path: resolve(process.cwd(), '.env.local') })

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const csvPath = args.find((a) => !a.startsWith('--'))

if (!csvPath) {
  console.error('Usage: tsx scripts/import-pieces.ts <path-to-csv> [--dry-run]')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Sanity client
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function randomKey(): string {
  return Math.random().toString(36).slice(2, 14)
}

// ---------------------------------------------------------------------------
// Sanity document types
// ---------------------------------------------------------------------------

type PieceTypeDoc = { _id: string; name: string; order?: number | null }
type BrandDoc = { _id: string; name?: string | null; instagram?: string | null }
type LookDoc = { _id: string; lookNumber?: string | null }

// ---------------------------------------------------------------------------
// CSV row type
// ---------------------------------------------------------------------------

type CsvRow = {
  lookNumber: string
  slot: string
  brands: string
  target?: string
}

// ---------------------------------------------------------------------------
// Resolved piece ready for patching
// ---------------------------------------------------------------------------

type ResolvedPiece = {
  _key: string
  _type: 'piece'
  slot: { _type: 'reference'; _ref: string }
  brands: { _key: string; _type: 'reference'; _ref: string }[]
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // --- Load CSV ---
  const csvContent = readFileSync(resolve(process.cwd(), csvPath!), 'utf-8')
  const rows: CsvRow[] = parseCsv(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  if (rows.length === 0) {
    console.error('CSV is empty or has no data rows.')
    process.exit(1)
  }

  console.log(`Parsed ${rows.length} CSV row(s) from "${csvPath}".`)

  // --- Load Sanity data ---
  const [pieceTypes, brands, looks] = await Promise.all([
    client.fetch<PieceTypeDoc[]>(`*[_type == "pieceType"]{ _id, name, order }`),
    client.fetch<BrandDoc[]>(`*[_type == "brand"]{ _id, name, instagram }`),
    client.fetch<LookDoc[]>(`*[_type == "look"]{ _id, lookNumber }`),
  ])

  console.log(
    `Loaded: ${pieceTypes.length} pieceType(s), ${brands.length} brand(s), ${looks.length} look(s).`,
  )

  // --- Build lookup indexes ---
  // pieceType: exact match by normalized name
  const pieceTypeByName = new Map<string, PieceTypeDoc>()
  for (const pt of pieceTypes) {
    if (pt.name) pieceTypeByName.set(normalize(pt.name), pt)
  }

  // look: by lookNumber (may have published + draft → two docs with same lookNumber)
  const looksByNumber = new Map<string, LookDoc[]>()
  for (const look of looks) {
    if (!look.lookNumber) continue
    const list = looksByNumber.get(look.lookNumber) ?? []
    list.push(look)
    looksByNumber.set(look.lookNumber, list)
  }

  // ---------------------------------------------------------------------------
  // Resolution phase (no patches yet)
  // ---------------------------------------------------------------------------

  type ResolvedRow = {
    rowIndex: number
    lookNumber: string
    lookDocs: LookDoc[]
    target?: string
    slot: PieceTypeDoc
    brandDocs: BrandDoc[]
  }

  const errors: string[] = []
  const resolved: ResolvedRow[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowLabel = `Row ${i + 2}` // +2: 1-indexed + header

    // --- lookNumber ---
    const lookNum = row.lookNumber?.trim()
    if (!lookNum) {
      errors.push(`${rowLabel}: missing lookNumber`)
      continue
    }
    const lookDocs = looksByNumber.get(lookNum)
    if (!lookDocs || lookDocs.length === 0) {
      errors.push(`${rowLabel}: no look found with lookNumber="${lookNum}"`)
      continue
    }

    // --- target filter ---
    const target = row.target?.trim() || undefined
    if (target && target !== 'published' && target !== 'draft') {
      errors.push(
        `${rowLabel}: invalid target="${target}" (expected "published", "draft", or empty)`,
      )
      continue
    }

    // Filter look docs by target if specified
    let filteredLooks = lookDocs
    if (target === 'published') {
      filteredLooks = lookDocs.filter((l) => !l._id.startsWith('drafts.'))
    } else if (target === 'draft') {
      filteredLooks = lookDocs.filter((l) => l._id.startsWith('drafts.'))
    }
    if (filteredLooks.length === 0) {
      errors.push(
        `${rowLabel}: no ${target} document found for lookNumber="${lookNum}"`,
      )
      continue
    }

    // --- slot ---
    const slotRaw = row.slot?.trim()
    if (!slotRaw) {
      errors.push(`${rowLabel}: missing slot`)
      continue
    }
    const slotDoc = pieceTypeByName.get(normalize(slotRaw))
    if (!slotDoc) {
      errors.push(
        `${rowLabel}: slot "${slotRaw}" not found in pieceType documents. ` +
          `Available: ${[...pieceTypeByName.values()].map((p) => `"${p.name}"`).join(', ')}`,
      )
      continue
    }

    // --- brands ---
    const brandsRaw = row.brands?.trim()
    if (!brandsRaw) {
      errors.push(`${rowLabel}: missing brands`)
      continue
    }
    const brandNames = brandsRaw.split(',').map((b) => b.trim()).filter(Boolean)
    if (brandNames.length === 0) {
      errors.push(`${rowLabel}: brands column is empty`)
      continue
    }

    const resolvedBrands: BrandDoc[] = []
    let rowHasError = false

    for (const brandName of brandNames) {
      const normBrand = normalize(brandName)

      // Substring match against brand.name and brand.instagram
      const candidates = brands.filter((b) => {
        const matchName = b.name ? normalize(b.name).includes(normBrand) : false
        const matchIg = b.instagram
          ? normalize(b.instagram.replace(/^@/, '')).includes(normBrand)
          : false
        return matchName || matchIg
      })

      if (candidates.length === 0) {
        errors.push(
          `${rowLabel}: brand "${brandName}" not found. ` +
            `Check brand.name or brand.instagram in the dataset.`,
        )
        rowHasError = true
      } else if (candidates.length > 1) {
        const names = candidates.map((c) => `"${c.name ?? c.instagram}"`)
        errors.push(
          `${rowLabel}: brand "${brandName}" is ambiguous — matches: ${names.join(', ')}. ` +
            `Use a more specific name.`,
        )
        rowHasError = true
      } else {
        resolvedBrands.push(candidates[0])
      }
    }

    if (rowHasError) continue

    resolved.push({
      rowIndex: i,
      lookNumber: lookNum,
      lookDocs: filteredLooks,
      target,
      slot: slotDoc,
      brandDocs: resolvedBrands,
    })
  }

  // --- Abort if any errors ---
  if (errors.length > 0) {
    console.error(`\nResolution failed with ${errors.length} error(s):\n`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    console.error('\nNo patches applied.')
    process.exit(1)
  }

  // ---------------------------------------------------------------------------
  // Group resolved rows by (look _id) → build pieces arrays
  // ---------------------------------------------------------------------------

  // Key: look _id → list of resolved pieces in CSV order
  const piecesByLookId = new Map<string, ResolvedPiece[]>()

  for (const r of resolved) {
    for (const lookDoc of r.lookDocs) {
      const list = piecesByLookId.get(lookDoc._id) ?? []
      list.push({
        _key: randomKey(),
        _type: 'piece',
        slot: { _type: 'reference', _ref: r.slot._id },
        brands: r.brandDocs.map((b) => ({
          _key: randomKey(),
          _type: 'reference',
          _ref: b._id,
        })),
      })
      piecesByLookId.set(lookDoc._id, list)
    }
  }

  // ---------------------------------------------------------------------------
  // Dry-run output
  // ---------------------------------------------------------------------------

  if (dryRun) {
    console.log('\n--- DRY RUN — proposed pieces per look ---\n')
    for (const [lookId, pieces] of piecesByLookId) {
      const lookNum = looks.find((l) => l._id === lookId)?.lookNumber ?? '?'
      console.log(`Look ${lookNum} (${lookId}): ${pieces.length} piece(s)`)
      for (const p of pieces) {
        const slotDoc = pieceTypes.find((pt) => pt._id === p.slot._ref)
        const brandNames = p.brands
          .map((b) => brands.find((br) => br._id === b._ref)?.name ?? b._ref)
          .join(' · ')
        console.log(`  ${slotDoc?.name ?? p.slot._ref}: ${brandNames}`)
      }
    }
    console.log('\n(dry-run: no writes)')
    return
  }

  // ---------------------------------------------------------------------------
  // Apply patches
  // ---------------------------------------------------------------------------

  console.log(`\nPatching ${piecesByLookId.size} look document(s)…`)

  for (const [lookId, pieces] of piecesByLookId) {
    const lookNum = looks.find((l) => l._id === lookId)?.lookNumber ?? '?'
    console.log(`  - Look ${lookNum} (${lookId}): ${pieces.length} piece(s)`)
    await client.patch(lookId).set({ pieces }).commit()
  }

  console.log(`\nDone. Patched ${piecesByLookId.size} document(s).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
