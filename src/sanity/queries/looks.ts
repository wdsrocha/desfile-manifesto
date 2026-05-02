import { defineQuery } from 'next-sanity'

export const allLooksQuery = defineQuery(`
  *[_type == "look"] | order(lookNumber asc) {
    _id,
    lookNumber,
    images[]{
      asset,
      alt,
      photographerName,
      photographerInstagram
    },
    model {
      name,
      instagram
    },
    styling
  }
`)
