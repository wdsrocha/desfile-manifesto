import { defineField, defineType } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const look = defineType({
  name: 'look',
  title: 'Look',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'lookNumber',
      title: 'Número do look',
      type: 'string',
      description: 'Ex.: "01", "02". Usado para ordenar e exibir.',
      validation: (Rule) =>
        Rule.required().regex(/^\d{2,}$/, {
          name: 'twoDigits',
          invert: false,
        }),
    }),
    defineField({
      name: 'images',
      title: 'Imagens',
      type: 'array',
      description:
        'A primeira imagem é a capa exibida na grid de looks. Arraste para reordenar.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Texto alternativo',
              type: 'string',
            }),
            defineField({
              name: 'photographer',
              title: 'Fotógrafo(a)',
              type: 'reference',
              to: [{ type: 'person' }],
              options: {
                filter: 'role == "photographer"',
                disableNew: false,
              },
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'model',
      title: 'Modelo',
      type: 'object',
      fields: [
        defineField({ name: 'name', title: 'Nome', type: 'string' }),
        defineField({
          name: 'instagram',
          title: 'Instagram',
          type: 'string',
          description: 'Inclua o @ (ex.: "@dacotamc").',
        }),
      ],
    }),
    defineField({
      name: 'styling',
      title: 'Styling',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Uma peça por linha. Ex.: "Camisa: Melanina".',
    }),
  ],
  orderings: [
    {
      title: 'Por número (asc)',
      name: 'lookNumberAsc',
      by: [{ field: 'lookNumber', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'lookNumber',
      subtitle: 'model.name',
      media: 'images.0',
    },
    prepare: ({ title, subtitle, media }) => ({
      title: title ? `Look ${title}` : 'Look',
      subtitle: subtitle ?? undefined,
      media,
    }),
  },
})
