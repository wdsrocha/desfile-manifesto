import { defineQuery } from 'next-sanity'

export const allLooksQuery = defineQuery(`
  *[_type == "look"] | order(orderRank asc) {
    _id,
    images[]{
      hotspot,
      crop,
      asset->{
        _id,
        _type,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
          lqip
        }
      },
      alt,
      photographer->{
        _id,
        name,
        stageName,
        instagram
      }
    },
    model {
      name,
      instagram
    },
    pieces[]{
      _key,
      slot->{ _id, name },
      brands[]->{ _id, name, instagram }
    }
  }
`)
