import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const brand = defineType({
  name: 'brand',
  title: 'Marca / Criativo',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nome / Marca',
      type: 'string',
      description: 'Nome curto exibido na grade (ex.: "Melanina AM").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fullName',
      title: 'Nome completo',
      type: 'string',
      description: 'Nome oficial completo, se diferente do nome de exibição.',
    }),
    defineField({
      name: 'segment',
      title: 'Segmento',
      type: 'string',
      description: 'Ex.: "Camisetaria", "Crochê", "Biojóias".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'string',
      description: 'Inclua o @ (ex.: "@melanina.am").',
    }),
    defineField({
      name: 'image',
      title: 'Imagem (opcional)',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'order',
      title: 'Ordem',
      type: 'number',
      description: 'Menor aparece primeiro na grade.',
    }),
  ],
  orderings: [
    {
      title: 'Manual (ordem asc)',
      name: 'orderAsc',
      by: [
        { field: 'order', direction: 'asc' },
        { field: 'name', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'segment', media: 'image' },
  },
})
