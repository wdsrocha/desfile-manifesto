import { defineField, defineType } from 'sanity'
import { UserIcon } from '@sanity/icons'

export const person = defineType({
  name: 'person',
  title: 'Pessoa',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nome completo',
      type: 'string',
      description: 'Nome civil ou de batismo. Pode ser omitido se a pessoa só assina pelo nome artístico.',
    }),
    defineField({
      name: 'stageName',
      title: 'Nome artístico / como aparece',
      type: 'string',
      description: 'Como o nome será exibido no site (ex.: "Glícia Cáuper").',
    }),
    defineField({
      name: 'role',
      title: 'Papel',
      type: 'string',
      options: {
        list: [
          { title: 'Modelo', value: 'model' },
          { title: 'Produção Executiva', value: 'production' },
          { title: 'Fotógrafo', value: 'photographer' },
          { title: 'Voluntário', value: 'volunteer' },
          { title: 'Apoio institucional', value: 'institutional' },
          { title: 'Parceiro', value: 'partner' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'string',
      description: 'Inclua o @ (ex.: "@gliciacauper").',
    }),
    defineField({
      name: 'image',
      title: 'Imagem',
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
      description: 'Menor aparece primeiro dentro do mesmo papel.',
    }),
  ],
  orderings: [
    {
      title: 'Por papel + ordem',
      name: 'roleOrderAsc',
      by: [
        { field: 'role', direction: 'asc' },
        { field: 'order', direction: 'asc' },
        { field: 'stageName', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: {
      stageName: 'stageName',
      name: 'name',
      role: 'role',
      media: 'image',
    },
    prepare: ({ stageName, name, role, media }) => ({
      title: stageName || name || 'Sem nome',
      subtitle: role,
      media,
    }),
  },
})
