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
    defineField({
      name: 'order',
      title: 'Ordem',
      type: 'number',
      description: 'Menor aparece primeiro no picker.',
    }),
  ],
  orderings: [
    {
      title: 'Por ordem (asc)',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'order',
    },
    prepare: ({ title, subtitle }) => ({
      title: title ?? 'Tipo de peça',
      subtitle: subtitle != null ? `Ordem: ${subtitle}` : undefined,
    }),
  },
})
