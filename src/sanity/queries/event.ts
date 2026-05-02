import { defineQuery } from 'next-sanity'

export const currentEventQuery = defineQuery(`
  *[_type == "event"] | order(_createdAt asc) [0] {
    name,
    edition,
    humanDate,
    displayDate,
    isoDate,
    location,
    concept,
    intro,
    longDescription
  }
`)

export const nextEventQuery = defineQuery(`
  *[_type == "nextEvent"] | order(_createdAt asc) [0] {
    edition,
    date,
    location
  }
`)
