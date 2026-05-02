import { defineField, defineType } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export const event = defineType({
  name: 'event',
  title: 'Evento atual',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nome',
      type: 'string',
      description: 'Nome principal do evento (aparece no rodapé).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'edition',
      title: 'Edição',
      type: 'string',
      description: 'Ex.: "Semana Fashion Revolution".',
    }),
    defineField({
      name: 'humanDate',
      title: 'Data legível',
      type: 'string',
      description: 'Ex.: "26 de Abril de 2026".',
    }),
    defineField({
      name: 'displayDate',
      title: 'Data curta (PT-BR)',
      type: 'string',
      description: 'Ex.: "26/04/2026". Aparece em telas pequenas.',
    }),
    defineField({
      name: 'isoDate',
      title: 'Data (ISO)',
      type: 'date',
      description: 'Usada no atributo dateTime de <time>.',
    }),
    defineField({
      name: 'location',
      title: 'Local',
      type: 'string',
      description: 'Ex.: "Manaus, AM".',
    }),
    defineField({
      name: 'concept',
      title: 'Conceito',
      type: 'text',
      rows: 3,
      description: 'Frase-conceito que aparece no Hero.',
    }),
    defineField({
      name: 'intro',
      title: 'Introdução',
      type: 'text',
      rows: 6,
      description: 'Primeiro parágrafo da seção "Sobre o evento".',
    }),
    defineField({
      name: 'longDescription',
      title: 'Descrição longa',
      type: 'text',
      rows: 8,
      description: 'Segundo parágrafo da seção "Sobre o evento".',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'humanDate' },
  },
})
