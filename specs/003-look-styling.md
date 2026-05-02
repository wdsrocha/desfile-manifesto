# PRD 003 — Styling estruturado por peça com referência a marcas

> Status: Draft
> Autor: Wesley Rocha
> Data: 2026-05-02
> Audiência: Wesley (decisor) e agentes de codificação executando fases isoladas

---

## 1. Sumário executivo

O campo `styling` do `look`, hoje uma lista de strings livres (`"Camisa: Melanina"`), passa a ser uma lista estruturada de **peças**, onde cada peça tem um `slot` (camisa, bermuda, colar, chapéu, …) e uma lista de **referências** ao schema `brand` já existente. No site, cada marca renderiza como link clicável que abre o Instagram da marca em nova aba. Migração **incremental** em fases auto-contidas: schema + parser, depois consumo no front.

**Estado final**: o schema `look` armazena `pieces: array<{ slot: string, brands: reference<brand>[] }>` no lugar de `styling: string[]`. O `LookViewer` renderiza cada peça como uma linha (`Camisa  Melanina AM · Pacovã`) com cada marca como link para `https://instagram.com/<handle>`. Peças sem marcas não existem (validação no schema). A seção inteira não renderiza se o array `pieces` estiver vazio. Os 22 documentos `brand` já cadastrados são reutilizados; a migração faz fuzzy-match das strings legadas contra eles.

---

## 2. Decisões já tomadas (não revisitar sem justificativa)

| Decisão                       | Valor                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Forma do schema               | Array de objetos `{ slot, brands[] }` — flexível e extensível, sem campos hardcoded por tipo de peça                       |
| Lista inicial de slots        | `shirt`, `shorts`, `necklace`, `hat` (PT-BR: Camisa, Bermuda, Colar, Chapéu)                                               |
| Convenção de slot values      | Inglês camelCase (consistente com `person.role`: `model`, `photographer`)                                                  |
| Ordem dos slots na UI         | Ordem manual do array no Studio (drag-to-reorder). Não é alfabética nem fixa.                                              |
| Múltiplas marcas por slot     | Sim. `brands: array<reference<brand>>`, min 1.                                                                             |
| Slot duplicado num mesmo look | Permitido (sem validação). Caso raro; editor decide.                                                                       |
| Marca: dado canônico          | `brand.name` para exibição; `brand.instagram` para o link. Sem fallback inline.                                            |
| Render                        | Dentro do `LookViewer`, substituindo o bloco `Styling` atual. Mesmo eyebrow `Styling` mantido como título da seção.        |
| Comportamento de link         | `<a target="_blank" rel="noreferrer noopener">` sobre cada nome de marca. Sem ícone. Apenas o nome é clicável.             |
| Separador entre marcas        | ` · ` (middle dot com espaços)                                                                                             |
| Marca sem `instagram`         | Renderiza nome como `<span>`, não `<a>`. Não esconde.                                                                      |
| Substituição vs paralelo      | Substitui `styling`. Os dois campos não convivem. Migração move o que dá; o que não casar fica logado e o editor completa. |
| Fuzzy-match na migração       | Case-insensitive, substring nos dois sentidos contra `brand.name` e `brand.instagram`. Sem similarity score.               |
| Slot combinado no legado      | `"Colares e chapéu: <marca>"` → cria duas peças, `necklace` e `hat`, ambas com a mesma marca. Decisão explícita do Wesley. |
| Marca não encontrada          | A peça é gerada mesmo assim com `brands: []` e o script loga o termo não-resolvido. Editor finaliza no Studio.             |
| Validação de schema           | `pieces[].slot` required; `pieces[].brands` min 1. Ambas no `defineField`. Documentos legacy migrados podem violar a min1. |
| Tratamento de violação        | Migração que produz `brands: []` é commitada; a validação só dispara ao editor abrir o doc no Studio (warning, não erro).  |

---

## 3. Arquitetura / modelo mental

**Schema (Sanity Content Lake):**
```
look {
  lookNumber: string
  images: [...]                       // PRD 002
  model: { name, instagram }
  pieces: [                            // novo, substitui styling
    {
      slot: 'shirt' | 'shorts' | 'necklace' | 'hat' | ...,
      brands: [ reference -> brand ]
    }
  ]
}

brand {
  name: string
  instagram: string                   // com @
  ...
}
```

**Fluxo de leitura (RSC → modal):**
```
allLooksQuery (GROQ):
  pieces[]{
    slot,
    brands[]->{ _id, name, instagram }
  }
        │
        ▼
LookViewer recebe look.pieces
        │
        ▼
Para cada piece:
  <PieceRow slot={piece.slot} brands={piece.brands}>
    <SlotLabel>           ← mapeia 'shirt' → 'Camisa'
    <BrandList>           ← marcas separadas por ' · ', cada nome é <a> ou <span>
```

**Fluxo editorial (Studio):**
```
Editor abre look → adiciona item em pieces[] → escolhe slot (radio/dropdown) →
  array de brands aparece → editor clica "Add" → escolhe brand existente
  (filtro implícito: documentos do tipo brand) → salva.
```

**Trade-off chave**: a estrutura em array de objetos com `slot` enum é mais click-intensive no Studio do que 4 campos hardcoded, mas evita schema rigidez e permite slots novos (cinto, brincos, sapato) sem release.

---

## 4. Convenções

- Nomes de campos em inglês (`pieces`, `slot`, `brands`); títulos e descriptions em PT-BR.
- Valor de `slot` segue convenção do `person.role`: inglês camelCase. Mapping para PT-BR fica no front (mapa estático em `src/lib/slot-labels.ts`).
- Lista de slots permitidos definida **uma única vez** em `src/sanity/schemas/look.ts`. Para adicionar slot novo: editar a `list` de options + adicionar a entrada correspondente em `slot-labels.ts`. Nada mais.
- Component novo: `src/components/LookPieces.tsx` — encapsula o render da seção. `LookViewer` importa e passa `look.pieces`.
- Não criar novo schema (`piece` document) nem object reutilizável (`pieceObject`). Inline no array do `look`. Se virar reutilizável depois, refatora.
- A query GROQ derefencia brands por padrão (`brands[]->`). Não fazer query separada para "brands de um look" — projeção dentro de `allLooksQuery` é suficiente.

---

## 5. Estratégia de ambientes

Sem mudanças. Mesmo dataset `production` em local/preview/prod (decisão de PRD 001).

A migração de conteúdo (parser de `styling` → `pieces`) roda contra `production` uma vez, executada localmente pelo Wesley com `SANITY_API_WRITE_TOKEN`. Ver Phase 0.

---

## 6. Restrições técnicas / limites externos

- **Sanity references**: cada `reference<brand>` é uma chamada de dereference no GROQ. Para os looks atuais (até ~30 com 1-4 peças cada), o overhead é desprezível.
- **Studio UX**: o picker de reference no Sanity Studio mostra todos os 22 brands com search por nome. Sem filtro adicional necessário.
- **Validação min(1)** em `brands` de uma peça importa só para edição manual. A migração pode produzir peças com `brands: []` quando o fuzzy-match falha — e isso é intencional para não perder a intenção do editor (o slot fica visível como pendência).
- **Não há regressão de bundle**: nenhuma lib nova. Render é JSX puro.
- **TypeGen**: `npm run typegen` precisa rodar com Node 24 (memória anotada).

---

## 7. Riscos e mitigações

| Risco                                                                               | Probabilidade | Mitigação                                                                                                                                |
| ----------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Parser do legado interpreta string ambígua e cria peça errada                       | Médio         | Dry-run obrigatório; output do dry-run lista cada `lookNumber` com strings → peças propostas para o Wesley revisar antes do run real     |
| Fuzzy-match casa marca errada (ex.: "1970" → "Ateliê 1970" vs "1970 Atelier" novo)  | Baixo         | Match estrito por substring sem fuzzy real; ambíguo (>1 candidato) → loga e deixa `brands: []`                                           |
| Slot legado não mapeado (ex.: "Sapato: X")                                          | Médio         | Lista hardcoded de prefixos→slot no parser. Prefixo desconhecido → loga e pula a string. Editor adiciona manualmente.                    |
| Editor adiciona slot duplicado (ex.: dois `shirt` no mesmo look)                    | Baixo         | Permitido (caso raro pode ser legítimo). UI renderiza ambos na ordem do array.                                                           |
| Brand referenciada é deletada                                                       | Baixo         | Sanity gera reference quebrada. GROQ retorna `null` no dereference; render filtra `null` no front. Não bloqueia.                         |
| Documentos `look` em draft com `styling` divergem da versão publicada               | Médio         | Script processa published e drafts separadamente (perspective `raw`). Patch idempotente: se `pieces` já existe e não-vazio, pula.        |
| Validação `min(1)` em `brands` quebra o Studio para looks recém-migrados sem match  | Baixo         | Validação é warning no Studio, não bloqueia salvar. Editor vê o aviso e completa.                                                        |

---

## 8. Roteiro de fases

> Como ler: cada fase é auto-contida. Um agente executa uma fase lendo apenas:
> este PRD, AGENTS.md, a fase corrente e os arquivos listados em "Arquivos tocados".

### Status das fases

| Fase | Título                                     | Prioridade | Status |
| ---- | ------------------------------------------ | ---------- | ------ |
| 0    | Schema (`pieces`) + lista de slots         | P0         | ⬜      |
| 1    | Migração de `styling` → `pieces`           | P0         | ⬜      |
| 2    | Query, tipos e render no `LookViewer`      | P0         | ⬜      |
| 3    | Remoção do campo legado `styling`          | P1         | ⬜      |

---

### Fase 0 — Schema (`pieces`) + lista de slots [P0]

**Objetivo**: introduzir o campo `pieces` no schema `look` com a lista de slots inicial. Não remover `styling` ainda — os dois convivem temporariamente para permitir migração e rollback.

**Pré-requisitos**: nenhum.

**Arquivos a criar:**
- `src/lib/slot-labels.ts` — mapa estático `Record<SlotValue, string>` em PT-BR. Singular fixo (Camisa, Bermuda, Colar, Chapéu). Exporta também o tipo `SlotValue`. Único arquivo onde a lista PT-BR existe.

**Arquivos a modificar:**
- `src/sanity/schemas/look.ts` — adicionar field `pieces` como `array` de `object` com:
  - `slot`: `string`, `options.list = [{title:'Camisa',value:'shirt'}, {title:'Bermuda',value:'shorts'}, {title:'Colar',value:'necklace'}, {title:'Chapéu',value:'hat'}]`, `options.layout = 'radio'`, validation required.
  - `brands`: `array` of `reference` to `[{type:'brand'}]`, validation `min(1)`.
  - Preview do object: title via lookup do slot label, subtitle = `${brands.length} marca(s)`. Selecionar `brands.0.name` como auxiliar se desejar mostrar um nome.
  - Description do array: "Cada peça do look com sua(s) marca(s). Slots vazios não aparecem no site."
- Não tocar em `styling` ainda — fica intocado para a Fase 1 ler.

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. `nvm use 24 && npm run typegen` — regenerar tipos.
2. Verificar manualmente no Studio (`npm run sanity` ou onde o Studio rodar) que o novo campo aparece com a lista de slots e o picker de brand funciona.

**Migração de conteúdo:** nenhuma nesta fase.

**Critérios de aceitação:**
- [ ] `npm run typegen` gera o tipo `Look` com `pieces?: Array<{ slot: 'shirt' | 'shorts' | 'necklace' | 'hat'; brands?: ... }>`.
- [ ] `tsc --noEmit` passa.
- [ ] No Studio, o campo `Peças` aparece abaixo de `Styling`. Adicionar uma peça funciona: escolher slot (radio com 4 opções) → adicionar marcas via reference picker.
- [ ] Salvar com `brands` vazio gera warning de validação no Studio.

**Commits sugeridos:**
1. `feat(look): add pieces field with brand references`

**Notas para o agente:**
- A `list` de slots usa exatamente: `shirt`, `shorts`, `necklace`, `hat`. Não inventar novos. Se o Wesley pedir mais depois, é trocar a `list` + `slot-labels.ts`.
- Para extensibilidade futura, manter a `list` como única fonte. Não duplicar em outro arquivo.
- Não adicionar `defineType` separado para a peça — usar `defineArrayMember({ type: 'object', name: 'piece', fields: [...] })` inline.
- Preview do object: pode usar `prepare` com o mapa `slot-labels` importado. Sanity aceita imports comuns no schema.

---

### Fase 1 — Migração de `styling` → `pieces` [P0]

**Objetivo**: parsear cada string em `styling` em uma ou mais peças, casar marcas contra documentos `brand` existentes, e popular `pieces`. Idempotente. Não remove `styling`.

**Pré-requisitos**: Fase 0.

**Arquivos a criar:**
- `scripts/migrate-look-styling.ts` — espelha o padrão de `scripts/migrate-look-photographers.ts`. Lê todos os looks (`perspective: raw`, published + drafts). Para cada look:
  1. Skip se `pieces` existe e não está vazio.
  2. Parser de cada `styling[i]`:
     - Trim + lowercase para split na primeira `:`.
     - Mapa de prefixos legados para slots:
       - `'camisa'`, `'camisetas'` → `shirt`
       - `'bermuda'`, `'bermudas'`, `'shorts'` → `shorts`
       - `'colar'`, `'colares'` → `necklace`
       - `'chapéu'`, `'chapeus'`, `'chapéus'`, `'chapeu'` → `hat`
       - `'colares e chapéu'`, `'colar e chapéu'`, `'colares e chapeu'` → DUAS peças: `necklace` **e** `hat`, ambas com as mesmas marcas resolvidas.
     - Prefixo desconhecido → log + pula a string.
  3. Resolver marcas (depois do `:`):
     - Pode haver múltiplas separadas por `,` ou `e` ou `&`. Splitter regex: `/\s*(?:,|\se\s|&)\s*/i`.
     - Para cada termo, fuzzy-match contra `brand.name` e `brand.instagram`:
       - Normaliza: lowercase, sem acentos, trim.
       - Match: substring nos dois sentidos (`needle` em `haystack` OU `haystack` em `needle`). Pega o primeiro match. Se >1 candidato, log de ambiguidade e deixa `brands: []` para essa peça.
       - Sem match → log + `brands: []` para essa peça (peça é criada do mesmo jeito; editor finaliza).
  4. Patch: `client.patch(_id).set({ pieces: parsedPieces }).commit()`. Não remover `styling` ainda.

**Arquivos a modificar:** nenhum.

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. Backup do dataset: `npx sanity dataset export production backup-pre-pr-003.tar.gz`.
2. Dry-run: `tsx scripts/migrate-look-styling.ts --dry-run` — output mostra, por look, cada string original → peças propostas. Wesley revisa antes do run real.
3. Run real: `tsx scripts/migrate-look-styling.ts`.
4. Verificar no Studio: cada look migrado tem `pieces` populado; o campo `styling` ainda existe (será removido na Fase 3).

**Migração de conteúdo:**
- Looks atuais (snapshot na escrita desta spec):
  - Look 01 published: `["Camisa: Melanina", "Bermuda: 1970", "Colares e chapéu: Ateliê Fernanda Menezes"]`
    - Esperado: `[ {slot:'shirt', brands:[<Melanina AM>]}, {slot:'shorts', brands:[<Ateliê 1970>]}, {slot:'necklace', brands:[<Ateliê Fernanda Menezes>]}, {slot:'hat', brands:[<Ateliê Fernanda Menezes>]} ]`
    - Fuzzy-match esperado: `"Melanina"` → `Melanina AM`; `"1970"` → `Ateliê 1970`; `"Ateliê Fernanda Menezes"` → `Ateliê Fernanda Menezes` (exato).
  - Look 01 draft: idem mais uma string vazia que deve ser ignorada.
  - Look 02 draft: `styling: null` → nada a migrar; pula.

**Critérios de aceitação:**
- [ ] Dry-run produz output legível com mapping linha-a-linha.
- [ ] Run real popula `pieces` em looks com `styling` não-vazio.
- [ ] Look 01: 4 peças resultantes (camisa, bermuda, colar, chapéu), todas com marca casada.
- [ ] Re-rodar o script é no-op (skip por `pieces` já existir e não-vazio).
- [ ] Strings com prefixo desconhecido aparecem nos logs e a peça correspondente **não** é criada.
- [ ] Marcas ambíguas ou não resolvidas viram peça com `brands: []` e log claro.

**Commits sugeridos:**
1. `chore(looks): migrate legacy styling strings to pieces with brand refs`

**Notas para o agente:**
- Use o padrão exato do `scripts/migrate-look-photographers.ts` para env loading, client e perspective. Não reinventar.
- O `client.patch` aqui é simples (apenas `set({ pieces })`). Não precisa do split set/unset por commit que aquele script teve.
- Para o dry-run, NÃO escreva nada no Sanity. Só logue.
- `brands` no patch deve ter shape `[{ _type: 'reference', _ref: <brand_id>, _key: <random> }]`. Sanity exige `_key` em arrays; gere com `Math.random().toString(36).slice(2, 14)` (mesmo padrão do `migrate-look-images.ts`).
- Ao normalizar para fuzzy-match, use `String.prototype.normalize('NFD').replace(/[̀-ͯ]/g, '')` para remover acentos. Não use libs externas.
- Caso surja outra string legada que não combine com nenhum prefixo, **não** crie um catch-all `'misc'` slot. Pular é melhor — o editor revisa no Studio.

---

### Fase 2 — Query, tipos e render no `LookViewer` [P0]

**Objetivo**: o site passa a renderizar `pieces` em vez de `styling`. Cada peça vira uma linha; cada marca vira um link.

**Pré-requisitos**: Fase 1.

**Arquivos a criar:**
- `src/components/LookPieces.tsx` — Server Component (não precisa de interatividade). Props: `pieces: AllLooksQueryResult[number]['pieces']`. Lógica:
  - Filtra peças sem marcas (`brands?.length > 0`).
  - Se nada sobrar, retorna `null`.
  - Renderiza `<div>` com eyebrow `Styling` (mantido para continuidade visual). Lista de linhas: cada linha é `<SlotLabel> + <BrandList>`. Layout flex-col gap-1, mesmo do `styling` atual.
  - `SlotLabel`: lookup em `slot-labels.ts`. Estilo neutro (sem peso).
  - `BrandList`: `brands.map(b => b.instagram ? <a href=...>{b.name}</a> : <span>{b.name}</span>)` joinados por ` · `. Usar `<React.Fragment>` ou `flatMap` para inserir o separador como nó React.
  - Link: `target="_blank"` + `rel="noreferrer noopener"`. Estilo igual ao link de IG do model no `LookViewer` atual (`text-ink/60 hover:text-ink transition-colors underline-offset-2 decoration-ink/20`). **Sem** `@`. Apenas o nome da marca aparece.

**Arquivos a modificar:**
- `src/sanity/queries/looks.ts` — adicionar projeção:
  ```
  pieces[]{
    slot,
    brands[]->{ _id, name, instagram }
  }
  ```
  Manter `styling` na query temporariamente (só removida na Fase 3) para evitar quebrar tipos enquanto coexistem.
- `src/components/LookViewer.tsx` — substituir o bloco `{look.styling && look.styling.length > 0 && ...}` por `<LookPieces pieces={look.pieces} />`. Importar `LookPieces`.

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. `nvm use 24 && npm run typegen` para regerar tipos com a nova projeção.
2. `npm run dev` e abrir um look no modal. Validar manualmente os critérios.

**Migração de conteúdo:** nenhuma.

**Critérios de aceitação:**
- [ ] Look 01 no modal: 4 linhas (Camisa, Bermuda, Colar, Chapéu), cada uma com a respectiva marca como link clicável.
- [ ] Click em "Melanina AM" abre `https://instagram.com/melanina.am` em nova aba.
- [ ] Look 02 (sem peças): seção `Styling` não renderiza nada.
- [ ] Marca sem `instagram` (caso aconteça): nome aparece como texto, não link.
- [ ] `tsc --noEmit` passa.
- [ ] Build passa (`npm run build`).

**Commits sugeridos:**
1. `feat(looks): project pieces with brand refs in groq query`
2. `feat(looks): render structured pieces with clickable brand links`

**Notas para o agente:**
- Eyebrow continua `Styling` por consistência editorial. Não trocar para `Peças` sem o Wesley pedir.
- Para inserir separadores entre marcas: `brands.flatMap((b, i) => i === 0 ? [<BrandLink/>] : [' · ', <BrandLink/>])` é o jeito mais limpo. Usar `React.Fragment` com `key` por marca.
- Se uma `brand` referenciada estiver deletada, o GROQ retorna `null` no array `brands`. Filtrar no front: `brands?.filter(Boolean)`.
- Não adicionar prefixo `@` em nenhum lugar do render. O nome da marca é o que aparece. O `@` fica só na URL.
- `LookPieces` pode ser RSC (sem `"use client"`); links normais não exigem JS.

---

### Fase 3 — Remoção do campo legado `styling` [P1]

**Objetivo**: `styling` sai do schema, da query, dos tipos e do banco. Limpeza pós-migração.

**Pré-requisitos**: Fase 2 em produção e validada por pelo menos uma sessão de revisão editorial. Wesley dá o ok explícito.

**Arquivos a criar:**
- `scripts/cleanup-look-styling.ts` — script one-shot que faz `client.patch(_id).unset(['styling']).commit()` para todos os `look`. Idempotente.

**Arquivos a modificar:**
- `src/sanity/schemas/look.ts` — remover field `styling`.
- `src/sanity/queries/looks.ts` — remover `styling` da projeção.
- `src/components/LookViewer.tsx` — remover qualquer referência residual a `look.styling` (já não deve existir após Fase 2, mas confirmar).

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. Dry-run: `tsx scripts/cleanup-look-styling.ts --dry-run`.
2. Run real: `tsx scripts/cleanup-look-styling.ts`.
3. `nvm use 24 && npm run typegen`.

**Migração de conteúdo:**
- Unset `styling` em todos os documentos `look` (published + drafts).

**Critérios de aceitação:**
- [ ] `npm run typegen` produz tipo `Look` sem `styling`.
- [ ] `tsc --noEmit` passa.
- [ ] No Studio, o campo `Styling` antigo desapareceu da UI.
- [ ] Query no Vision: `*[_type=='look'][0]{styling}` retorna `null`.

**Commits sugeridos:**
1. `chore(look): drop legacy styling field after pieces migration`
2. `chore(content): unset styling field in all look documents`

**Notas para o agente:**
- Não combinar Phase 3 com Phase 2 num mesmo PR. Manter campo legado conviva por uma janela permite rollback via revert.
- O `unset` em todos os looks é seguro porque a Fase 1 já populou `pieces` e a Fase 2 já está consumindo `pieces`. Se algo deu errado, este passo só executa após sign-off.

---

## 9. Glossário

- **Peça (piece)**: item do array `pieces` em um `look`. Tem um `slot` e `brands[]`.
- **Slot**: tipo da peça (`shirt`, `shorts`, `necklace`, `hat`, …). Valor em inglês; label em PT-BR via `slot-labels.ts`.
- **Brand**: documento já existente no Sanity (22 cadastrados). Reusado por referência.
- **Fuzzy-match**: comparação case-insensitive sem acentos por substring nos dois sentidos. Não usa similarity score.
- **Slot combinado legado**: string como `"Colares e chapéu: <marca>"` é tratada como duas peças com a mesma lista de marcas.

---

## 10. Apêndice — Configuração

| Variável                 | Ambientes    | Valor                                                                                            |
| ------------------------ | ------------ | ------------------------------------------------------------------------------------------------ |
| `SANITY_API_WRITE_TOKEN` | local apenas | Token com permissão de write, usado pelos scripts das Fases 1 e 3. Não exportar para Vercel.     |

Sem novas envs em runtime. Sem novos webhooks. Sem mudanças de CORS.

---

## 11. Fora de escopo (não agora)

- Filtros na home por marca ("ver todos os looks da Melanina AM").
- Página dedicada por marca (`/marcas/melanina-am`) com galeria.
- Slots adicionais (`pants`, `shoes`, `bag`, `earrings`, `belt`). Adicionar via PR pequeno quando precisar — o schema já é extensível.
- Validação custom anti-duplicação de slot (impedir dois `shirt` no mesmo look).
- Ordenação automática de slots na UI (ex.: forçar camisa antes de bermuda). A ordem é a do array.
- Suporte a "marca não cadastrada" (string livre como fallback). Editor cria o doc `brand` antes; reuso é a regra.
- Imagem da marca na lista. Apenas nome clicável.
- Tracking analítico de clique em marca.

---

## 12. Trade-offs discutidos

**Forma do schema**
- **Opção A (escolhida)**: `pieces: array<{ slot, brands[] }>` com slot enum extensível. Escolhida porque: permite slots novos sem release de código, ordem manual no Studio, escala para qualquer combinação editorial.
- **Opção B**: 4 campos hardcoded (`shirt`, `shorts`, `necklace`, `hat`), cada um `array<reference<brand>>`. Rejeitada porque: rigidez. Adicionar sapato vira mudança de schema + migração. UI tem que decidir ordem fixa entre 4 campos.
- **Opção C**: manter `styling: string[]` e parsear no front. Rejeitada porque: não resolve o problema (continua texto livre), e quebra a meta de cada marca virar link com base em referência canônica.

**Como representar a marca**
- **Opção A (escolhida)**: `reference<brand>`. Escolhida porque: 22 brands já existem, têm `name` + `instagram`, e o documento é a fonte canônica. Trocar o `@` da marca atualiza todos os looks de uma vez.
- **Opção B**: par inline `{ name, instagram }` em cada peça. Rejeitada porque: duplica a fonte da verdade, e o user explicitamente quer reuso.

**Slot combinado no legado**
- **Opção A (escolhida)**: `"Colares e chapéu"` vira **duas** peças com a mesma marca duplicada. Escolhida pelo Wesley.
- **Opção B**: gerar warning e deixar manual. Rejeitada porque: editor terá menos trabalho com a duplicação automática; é trivial remover uma das duas peças no Studio se for indesejado.

**Match de marca no parser**
- **Opção A (escolhida)**: substring case-insensitive sem acentos, primeiro hit. Ambíguo → não decide. Escolhida porque: dataset pequeno (22 brands), curadoria pode revisar; sem dependência externa.
- **Opção B**: similarity (Levenshtein, fuzzysort). Rejeitada porque: overhead para 22 itens; risco de match silencioso errado é maior que o ganho.
- **Opção C**: exigir nome exato. Rejeitada porque: o legado tem `"Melanina"` enquanto o doc é `"Melanina AM"` — exato falharia em todos os casos atuais.

**Convivência durante a transição**
- **Opção A (escolhida)**: `styling` e `pieces` convivem entre Fases 1 e 3. Escolhida porque: rollback via revert é trivial; sem janela de inconsistência no front.
- **Opção B**: rip-and-replace num único PR. Rejeitada porque: aumenta risco de migração + render quebrarem juntos sem rota de recuperação.

**Render: clicar no nome ou em um ícone**
- **Opção A (escolhida)**: o próprio nome da marca é o link. Escolhida porque: padrão do `PhotographerCredit` e do link do model; sem ruído visual.
- **Opção B**: nome + ícone Instagram ao lado. Rejeitada porque: adiciona elemento visual sem clareza extra; eyebrow `Styling` já é editorial e minimalista.
