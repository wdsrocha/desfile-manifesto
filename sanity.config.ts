import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemas } from './src/sanity/schemas'
import { env } from './src/sanity/env'

export default defineConfig({
  name: 'desfile-manifesto',
  title: 'Desfile Manifesto',
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemas },
})
