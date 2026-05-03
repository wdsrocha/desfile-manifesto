import { createClient } from 'next-sanity'
import { env } from './env'

const isDev = process.env.NODE_ENV === 'development'

export const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: !isDev,
  perspective: isDev ? 'previewDrafts' : 'published',
  token: env.SANITY_API_READ_TOKEN,
})
