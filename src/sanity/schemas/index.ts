import type { SchemaTypeDefinition } from 'sanity'
import { brand } from './brand'
import { creditGroup } from './creditGroup'
import { event } from './event'
import { look } from './look'
import { nextEvent } from './nextEvent'
import { person } from './person'

export const schemas: SchemaTypeDefinition[] = [
  event,
  nextEvent,
  look,
  brand,
  person,
  creditGroup,
]
