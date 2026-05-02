import type { StructureResolver } from 'sanity/structure'
import { CalendarIcon } from '@sanity/icons'

const SINGLETONS = ['event', 'nextEvent']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Conteúdo')
    .items([
      S.listItem()
        .title('Evento atual')
        .icon(CalendarIcon)
        .child(
          S.documentList()
            .title('Evento atual')
            .schemaType('event')
            .filter('_type == "event"'),
        ),
      S.listItem()
        .title('Próximo desfile')
        .icon(CalendarIcon)
        .child(
          S.documentList()
            .title('Próximo desfile')
            .schemaType('nextEvent')
            .filter('_type == "nextEvent"'),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !SINGLETONS.includes(item.getId() ?? ''),
      ),
    ])
