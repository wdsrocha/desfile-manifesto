import { defineQuery } from 'next-sanity'

export const allCreditGroupsQuery = defineQuery(`
  *[_type == "creditGroup"] | order(order asc) {
    _id,
    title,
    entries[] {
      _key,
      name,
      instagram
    }
  }
`)
