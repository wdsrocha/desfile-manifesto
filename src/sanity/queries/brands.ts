import { defineQuery } from 'next-sanity'

export const allBrandsQuery = defineQuery(`
  *[_type == "brand"] | order(order asc, name asc) {
    _id,
    name,
    fullName,
    segment,
    instagram,
    image
  }
`)
