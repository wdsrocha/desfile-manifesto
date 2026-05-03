import { defineQuery } from 'next-sanity'

export const allModelsQuery = defineQuery(`
  *[_type == "person" && role == "model"] | order(stageName asc) {
    _id,
    name,
    stageName,
    instagram,
    image
  }
`)

export const executiveProducerQuery = defineQuery(`
  *[_type == "person" && role == "production"] | order(stageName asc) [0] {
    _id,
    name,
    stageName,
    instagram,
    image
  }
`)
