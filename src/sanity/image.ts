import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'
import { env } from './env'

export const IMAGE_QUALITY = 90

const builder = createImageUrlBuilder({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
})

export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max')
}
