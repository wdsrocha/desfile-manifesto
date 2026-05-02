import { defineField, defineType } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export const nextEvent = defineType({
  name: 'nextEvent',
  title: 'Próximo desfile',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'edition',
      title: 'Edição',
      type: 'string',
      description: 'Ex.: "6ª Teia de Cultura Nacional".',
    }),
    defineField({
      name: 'date',
      title: 'Data',
      type: 'string',
      description: 'Ex.: "Entre 19 e 24 de maio".',
    }),
    defineField({
      name: 'location',
      title: 'Local',
      type: 'string',
      description: 'Ex.: "Aracruz, ES".',
    }),
  ],
  preview: {
    select: { title: 'edition', subtitle: 'location' },
  },
})
