import { defineQuery } from 'next-sanity'

export const allBrandsQuery = defineQuery(`
  *[_type == "brand"] | order(name asc) {
    _id,
    name,
    fullName,
    segment,
    instagram,
    image
  }
`)
