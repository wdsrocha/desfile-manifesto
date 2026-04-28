import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'gjpl1rmy',
    dataset: 'production',
  },
  typegen: {
    enabled: true,
    path: './src/**/*.{ts,tsx}',
    generates: './src/sanity/types.ts',
    overloadClientMethods: true,
  },
})
