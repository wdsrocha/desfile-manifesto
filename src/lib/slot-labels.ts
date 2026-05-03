export const SLOT_LABELS = {
  shirt: 'Camisa',
  shorts: 'Bermuda',
  necklace: 'Colar',
  hat: 'Chapéu',
} as const

export type SlotValue = keyof typeof SLOT_LABELS

export const SLOT_OPTIONS: { title: string; value: SlotValue }[] = (
  Object.entries(SLOT_LABELS) as [SlotValue, string][]
).map(([value, title]) => ({ title, value }))
