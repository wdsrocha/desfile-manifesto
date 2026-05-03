import type { StructureResolver } from 'sanity/structure'
import { CalendarIcon } from '@sanity/icons'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

const SINGLETONS = ['event', 'nextEvent']

export const structure: StructureResolver = (S, context) =>
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
      orderableDocumentListDeskItem({ type: 'look', title: 'Looks', S, context }),
      ...S.documentTypeListItems().filter(
        (item) => !([...SINGLETONS, 'look']).includes(item.getId() ?? ''),
      ),
    ])
