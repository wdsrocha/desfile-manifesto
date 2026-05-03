import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const pieceType = defineType({
  name: 'pieceType',
  title: 'Tipo de peça',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nome',
      type: 'string',
      description: 'Nome exibido no site (ex.: Camisa). Em PT-BR, singular.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Nome (A-Z)',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
    },
    prepare: ({ title }) => ({
      title: title ?? 'Tipo de peça',
    }),
  },
})
