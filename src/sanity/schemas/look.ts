import { defineArrayMember, defineField, defineType } from 'sanity'
import { ImageIcon } from '@sanity/icons'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export const look = defineType({
  name: 'look',
  title: 'Look',
  type: 'document',
  icon: ImageIcon,
  fields: [
    orderRankField({ type: 'look', hidden: true }),
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
      name: 'pieces',
      title: 'Peças',
      type: 'array',
      description:
        'Cada peça do look com sua(s) marca(s). Slots vazios não aparecem no site.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'piece',
          fields: [
            defineField({
              name: 'slot',
              title: 'Tipo de peça',
              type: 'reference',
              to: [{ type: 'pieceType' }],
              options: {
                disableNew: false,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'brands',
              title: 'Marcas',
              type: 'array',
              of: [{ type: 'reference', to: [{ type: 'brand' }] }],
              validation: (Rule) => Rule.min(1),
            }),
          ],
          preview: {
            select: {
              slotName: 'slot.name',
              brand0: 'brands.0.name',
              brand1: 'brands.1.name',
              brand2: 'brands.2.name',
            },
            prepare: ({ slotName, brand0, brand1, brand2 }) => {
              const names = [brand0, brand1, brand2].filter(Boolean)
              const subtitle = names.length ? names.join(' · ') : 'sem marca'
              return { title: slotName ?? 'Peça', subtitle }
            },
          },
        }),
      ],
    }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {
      title: 'model.name',
      media: 'images.0',
    },
    prepare: ({ title, media }) => ({
      title: title ? `Look — ${title}` : 'Look',
      media,
    }),
  },
})
