import type { SchemaTypeDefinition } from 'sanity'
import { brand } from './brand'
import { creditGroup } from './creditGroup'
import { person } from './person'

export const schemas: SchemaTypeDefinition[] = [brand, person, creditGroup]
