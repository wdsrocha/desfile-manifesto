import type { SchemaTypeDefinition } from 'sanity'
import { brand } from './brand'
import { creditGroup } from './creditGroup'
import { event } from './event'
import { nextEvent } from './nextEvent'
import { person } from './person'

export const schemas: SchemaTypeDefinition[] = [
  event,
  nextEvent,
  brand,
  person,
  creditGroup,
]
