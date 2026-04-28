import { defineArrayMember, defineField, defineType } from 'sanity'
import { UsersIcon } from '@sanity/icons'

export const creditGroup = defineType({
  name: 'creditGroup',
  title: 'Grupo de créditos',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      description: 'Nome do grupo (ex.: "Elenco", "Fotógrafos").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Ordem',
      type: 'number',
      description: 'Menor aparece primeiro na seção de créditos.',
    }),
    defineField({
      name: 'entries',
      title: 'Pessoas',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'creditEntry',
          fields: [
            defineField({
              name: 'name',
              title: 'Nome',
              type: 'string',
              description: 'Opcional. Se vazio, exibimos só o Instagram.',
            }),
            defineField({
              name: 'instagram',
              title: 'Instagram',
              type: 'string',
              description: 'Inclua o @ (ex.: "@dacotamc").',
            }),
          ],
          preview: {
            select: { name: 'name', instagram: 'instagram' },
            prepare: ({ name, instagram }) => ({
              title: name || instagram || 'Sem dados',
              subtitle: name && instagram ? instagram : undefined,
            }),
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Manual (ordem asc)',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', entries: 'entries' },
    prepare: ({ title, entries }) => ({
      title,
      subtitle: entries
        ? `${(entries as unknown[]).length} pessoa(s)`
        : 'Sem pessoas',
    }),
  },
})
