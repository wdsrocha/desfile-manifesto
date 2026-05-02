import { defineQuery } from 'next-sanity'

export const allLooksQuery = defineQuery(`
  *[_type == "look"] | order(lookNumber asc) {
    _id,
    lookNumber,
    images[]{
      asset->{
        _id,
        _type,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
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
    styling
  }
`)
