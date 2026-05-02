/**
 * One-shot migration: convert inline photographerName/photographerInstagram on
 * look.images[] into a reference to a `person` document (role == "photographer").
 *
 * Usage:
 *   tsx scripts/migrate-look-photographers.ts --dry-run
 *   tsx scripts/migrate-look-photographers.ts
 *
 * Behavior:
 *   - Collects unique (name, instagram) pairs from existing inline credits.
 *   - Looks for an existing person matching by instagram (preferred) or name.
 *   - Creates a new person (role: "photographer") for missing ones.
 *   - Patches each image: set `photographer` reference, unset legacy fields.
 *   - Idempotent: skips images that already reference a photographer or have
 *     no inline credit data.
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local (Editor permissions).
 * Operates on both published and draft documents (perspective: raw).
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

type LegacyImage = {
  _key: string
  photographerName?: string | null
  photographerInstagram?: string | null
  photographer?: { _ref?: string; _type?: string } | null
}

type LookDoc = {
  _id: string
  _rev: string
  images?: LegacyImage[] | null
}

type Person = {
  _id: string
  name?: string | null
  stageName?: string | null
  instagram?: string | null
  role?: string | null
}

const normalizeHandle = (raw?: string | null) =>
  raw ? raw.trim().replace(/^@/, '').toLowerCase() : ''

const normalizeName = (raw?: string | null) =>
  raw ? raw.trim().toLowerCase() : ''

async function main() {
  const looks = await client.fetch<LookDoc[]>(
    `*[_type == "look"]{ _id, _rev, images }`,
  )
  const photographers = await client.fetch<Person[]>(
    `*[_type == "person" && role == "photographer"]{ _id, name, stageName, instagram, role }`,
  )

  console.log(
    `Found ${looks.length} look document(s) and ${photographers.length} existing photographer person(s).`,
  )

  const byHandle = new Map<string, Person>()
  const byName = new Map<string, Person>()
  for (const p of photographers) {
    const h = normalizeHandle(p.instagram)
    if (h) byHandle.set(h, p)
    const n = normalizeName(p.stageName) || normalizeName(p.name)
    if (n) byName.set(n, p)
  }

  let imagesPatched = 0
  let imagesSkipped = 0
  let personsCreated = 0

  const ensurePerson = async (
    name: string | null | undefined,
    instagram: string | null | undefined,
  ): Promise<string | null> => {
    const handle = normalizeHandle(instagram)
    const cleanName = (name ?? '').trim()
    const nKey = normalizeName(cleanName)

    let match: Person | undefined
    if (handle) match = byHandle.get(handle)
    if (!match && nKey) match = byName.get(nKey)
    if (match) return match._id

    if (!cleanName && !handle) return null

    const handleWithAt = handle ? `@${handle}` : undefined
    const display = cleanName || handleWithAt || 'Fotógrafo(a)'
    console.log(
      `  + creating person: ${display}${handleWithAt ? ` (${handleWithAt})` : ''}${dryRun ? ' (dry-run)' : ''}`,
    )

    if (dryRun) {
      const fakeId = `dryrun-${handle || nKey || Math.random().toString(36).slice(2)}`
      const placeholder: Person = {
        _id: fakeId,
        name: cleanName || null,
        stageName: cleanName || null,
        instagram: handleWithAt ?? null,
        role: 'photographer',
      }
      if (handle) byHandle.set(handle, placeholder)
      if (nKey) byName.set(nKey, placeholder)
      return fakeId
    }

    const created = await client.create({
      _type: 'person',
      role: 'photographer',
      ...(cleanName ? { name: cleanName, stageName: cleanName } : {}),
      ...(handleWithAt ? { instagram: handleWithAt } : {}),
    })
    personsCreated++
    const newPerson: Person = {
      _id: created._id,
      name: cleanName || null,
      stageName: cleanName || null,
      instagram: handleWithAt ?? null,
      role: 'photographer',
    }
    if (handle) byHandle.set(handle, newPerson)
    if (nKey) byName.set(nKey, newPerson)
    return created._id
  }

  for (const look of looks) {
    if (!Array.isArray(look.images) || look.images.length === 0) continue

    type ImagePatch = {
      key: string
      ref: string | null
      cleanupOnly: boolean
    }
    const patches: ImagePatch[] = []

    for (const img of look.images) {
      const hasLegacy = !!(img.photographerName || img.photographerInstagram)
      const hasRef = !!img.photographer?._ref

      if (hasRef && !hasLegacy) {
        imagesSkipped++
        continue
      }

      if (hasRef && hasLegacy) {
        patches.push({ key: img._key, ref: null, cleanupOnly: true })
        continue
      }

      if (!hasLegacy) {
        imagesSkipped++
        continue
      }

      const personId = await ensurePerson(
        img.photographerName,
        img.photographerInstagram,
      )
      if (!personId) {
        imagesSkipped++
        continue
      }
      patches.push({ key: img._key, ref: personId, cleanupOnly: false })
    }

    if (patches.length === 0) continue

    console.log(
      `  - ${look._id}: patching ${patches.length} image(s)${dryRun ? ' (dry-run)' : ''}`,
    )

    if (!dryRun) {
      // Apply set + unset in two separate commits per image to avoid
      // Sanity rejecting overlapping operations on the same array entry.
      for (const p of patches) {
        if (!p.cleanupOnly && p.ref) {
          await client
            .patch(look._id)
            .set({
              [`images[_key=="${p.key}"].photographer`]: {
                _type: 'reference',
                _ref: p.ref,
              },
            })
            .commit()
        }
        await client
          .patch(look._id)
          .unset([
            `images[_key=="${p.key}"].photographerName`,
            `images[_key=="${p.key}"].photographerInstagram`,
          ])
          .commit()
      }
    }
    imagesPatched += patches.length
  }

  console.log(
    `\nDone. personsCreated=${personsCreated} imagesPatched=${imagesPatched} imagesSkipped=${imagesSkipped}${dryRun ? ' (dry-run, no writes)' : ''}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
