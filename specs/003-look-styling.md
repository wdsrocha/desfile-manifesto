# PRD 003 — Styling estruturado por peça com referência a marcas

> Status: Draft
> Autor: Wesley Rocha
> Data: 2026-05-02
> Audiência: Wesley (decisor) e agentes de codificação executando fases isoladas

---

## 1. Sumário executivo

O campo `styling` do `look`, hoje uma lista de strings livres (`"Camisa: Melanina"`), passa a ser uma lista estruturada de **peças**. Cada peça referencia um documento `pieceType` (Camisa, Bermuda, Colar, Chapéu, Bolsa, …) — um schema novo, gerenciado no Studio — e uma lista de referências ao schema `brand` já existente. No site, cada marca renderiza como link clicável para o Instagram. O input é feito por **dois caminhos complementares**: edição direta no Studio para casos pontuais e importação via planilha CSV para subidas em lote (típico após cada desfile).

**Estado final**: dois schemas novos coexistem. `pieceType` é o catálogo de tipos de peça, ordenável e extensível pelo Studio sem deploy. `look.pieces` armazena `[{ slot: reference<pieceType>, brands: reference<brand>[] }]`. Adicionar um tipo novo ("Pulseira") é criar um doc `pieceType`. Subir um desfile inteiro é preencher um CSV (`lookNumber,slot,brands`) e rodar `tsx scripts/import-pieces.ts ./looks.csv`. O `LookViewer` renderiza cada peça como uma linha (`Camisa  Melanina AM · Pacovã`) com cada marca como link. Peças sem marcas não renderizam. A migração dos looks legados acontece via o próprio importer: transcreve o `styling` atual num CSV de uma vez e roda.

---

## 2. Decisões já tomadas (não revisitar sem justificativa)

| Decisão                       | Valor                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Forma do schema               | `look.pieces: array<{ slot: reference<pieceType>, brands: reference<brand>[] }>`                                            |
| Tipo de peça (`pieceType`)    | Document type próprio com `name` (PT-BR, exibido) e `order` (sort manual). Editor cria/edita no Studio.                     |
| Seed inicial de `pieceType`   | `Camisa`, `Bermuda`, `Colar`, `Chapéu`. Criados na Fase 0 via script.                                                       |
| Como adicionar tipo novo      | Criar doc `pieceType` no Studio. Zero deploy.                                                                               |
| Múltiplas marcas por slot     | Sim. `brands: array<reference<brand>>`, validation `min(1)`.                                                                |
| Slot duplicado num mesmo look | Permitido (sem validação). Caso raro; editor decide.                                                                        |
| Input principal               | **Planilha CSV** via `scripts/import-pieces.ts`. Studio é fallback para edits pontuais.                                     |
| Schema do CSV                 | Colunas: `lookNumber`, `slot`, `brands`. Uma linha por peça. `brands` é lista separada por `,` (entre aspas se contém vírgula). |
| Marca: dado canônico          | `brand.name` para exibição; `brand.instagram` para o link.                                                                  |
| Render                        | Dentro do `LookViewer`, substituindo o bloco `Styling` atual. Eyebrow `Styling` mantido.                                    |
| Comportamento de link         | `<a target="_blank" rel="noreferrer noopener">` sobre cada nome de marca. Sem ícone. Apenas o nome é clicável.              |
| Separador entre marcas        | ` · ` (middle dot com espaços)                                                                                              |
| Marca sem `instagram`         | Renderiza nome como `<span>`, não `<a>`. Não esconde.                                                                       |
| Substituição vs paralelo      | Substitui `styling`. Migração move dados; `styling` é removido só na fase final.                                            |
| Match no importer             | Slot: case-insensitive sem acentos contra `pieceType.name`. Marca: substring case-insensitive sem acentos contra `brand.name`/`brand.instagram`. |
| Validação de schema           | `pieces[].slot` required; `pieces[].brands` `min(1)`.                                                                       |
| Importer idempotente          | Re-rodar com o mesmo CSV produz o mesmo estado. `pieces` é substituído integralmente por look.                              |
| Match não resolvido           | Importer **falha alto**: exit 1 com mensagem clara, sem aplicar nenhum patch. Editor corrige CSV ou cria o doc faltante.    |

---

## 3. Arquitetura / modelo mental

**Schema (Sanity Content Lake):**
```
pieceType {
  name: string            // PT-BR exibido (ex.: "Camisa")
  order: number           // sort manual no picker
}

brand {
  name: string
  instagram: string       // com @
  ...
}

look {
  lookNumber: string
  images: [...]                       // PRD 002
  model: { name, instagram }
  pieces: [                           // novo, substitui styling
    {
      slot: reference -> pieceType,
      brands: [ reference -> brand ]
    }
  ]
}
```

**Fluxo de leitura (RSC → modal):**
```
allLooksQuery (GROQ):
  pieces[]{
    _key,
    slot->{ _id, name, order },
    brands[]->{ _id, name, instagram }
  }
        │
        ▼
LookViewer recebe look.pieces
        │
        ▼
Para cada piece:
  <PieceRow slot={piece.slot} brands={piece.brands}>
    <SlotLabel>           ← piece.slot?.name (já em PT-BR, vem do doc)
    <BrandList>           ← marcas separadas por ' · ', cada nome é <a> ou <span>
```

**Fluxo editorial — caminho preferido (CSV):**
```
Wesley preenche planilha:
  lookNumber, slot, brands
  01, Camisa, Melanina AM
  01, Bermuda, Ateliê 1970
  01, Colar, "Ateliê Fernanda Menezes"
  01, Chapéu, "Ateliê Fernanda Menezes"
  ...
        │
        ▼
tsx scripts/import-pieces.ts ./looks.csv --dry-run
  → Output: para cada look, peças propostas + matches resolvidos
        │
        ▼
tsx scripts/import-pieces.ts ./looks.csv
  → patch look.pieces (substitui integralmente)
```

**Fluxo editorial — caminho complementar (Studio):**
```
Editor abre look → adiciona item em pieces[] → escolhe slot
  (reference picker mostra todos os pieceType, ordenados por order) →
  array de brands aparece → editor seleciona brands → salva.
```

**Trade-off chave**: dois inputs (CSV + Studio) duplicam a superfície de input, mas refletem dois usos reais — edit pontual vs subida em lote. Schema único garante coerência; os caminhos só diferem em UX.

---

## 4. Convenções

- Nomes de campos em inglês (`pieces`, `slot`, `brands`); títulos e descriptions em PT-BR.
- `pieceType.name` é PT-BR singular (Camisa, Bermuda, Colar, Chapéu, …). Sem mapa de tradução em código; o que está no doc é o que aparece na UI.
- Adicionar um tipo novo de peça é **operação editorial**: criar um doc `pieceType` no Studio. Não é mudança de código.
- Component novo: `src/components/LookPieces.tsx` — encapsula o render. `LookViewer` importa e passa `look.pieces`.
- A query GROQ derefencia `slot` e `brands` na projeção. Não fazer query separada.
- O importer (`scripts/import-pieces.ts`) é o caminho **principal** de input. Studio é fallback.
- Importer **falha alto e cedo**: linha com slot ou marca não resolvida é erro fatal. Exit 1, mensagem clara, nenhum patch aplicado.
- Não criar schema `piece` reutilizável (objeto inline no array do `look`). Se virar reutilizável depois, refatora.

---

## 5. Estratégia de ambientes

Sem mudanças. Mesmo dataset `production` em local/preview/prod (decisão de PRD 001).

A migração de conteúdo (Fase 2) e o uso recorrente do importer rodam contra `production` localmente pelo Wesley com `SANITY_API_WRITE_TOKEN`.

---

## 6. Restrições técnicas / limites externos

- **Sanity references**: `pieces[].slot->` e `brands[]->` adicionam dereferences à query principal. Para o volume atual (~30 looks × 1-4 peças × 1-3 marcas) é desprezível.
- **Studio UX**: o picker de reference para `slot` mostra todos os `pieceType` documents, ordenados por `order`. Para `brands`, o picker mostra os 22 brands existentes com search por nome.
- **Validação `min(1)` em `brands`**: warning no Studio para edição manual. O importer nunca produz `brands: []` (falha antes).
- **Validação `required` em `slot`**: idem; o importer nunca produz `slot: null`.
- **TypeGen**: `npm run typegen` precisa rodar com Node 24 (memória anotada).
- **Dependência nova**: parsing de CSV via `csv-parse` (devDependency). Lib enxuta, zero impacto no bundle do client.
- **Não há regressão de bundle no front**: nenhuma lib nova no client.

---

## 7. Riscos e mitigações

| Risco                                                                                | Probabilidade | Mitigação                                                                                                                        |
| ------------------------------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Slot do CSV não casa com nenhum `pieceType` (ex.: editor digita "Camiseta")          | Médio         | Importer falha alto. Mensagem indica linha + valor. Editor corrige CSV ou cria pieceType.                                        |
| Marca do CSV não casa com nenhum `brand`                                              | Médio         | Mesmo tratamento. Sem brands cadastradas, a marca aparece na lista de erros antes de qualquer patch.                             |
| Match ambíguo (ex.: "1970" casa com "Ateliê 1970" e "1970 Atelier")                  | Baixo         | Importer falha alto. Editor desambigua usando nome mais específico no CSV.                                                       |
| Editor adiciona slot duplicado (ex.: dois `Camisa` no mesmo look)                     | Baixo         | Permitido. UI renderiza ambos na ordem do array.                                                                                 |
| `pieceType` referenciado é deletado                                                   | Baixo         | Sanity gera reference quebrada. GROQ retorna `null`; render filtra peças com `slot: null`.                                       |
| Brand referenciada é deletada                                                         | Baixo         | Idem. Render filtra `brands` `null` no front.                                                                                    |
| Importer aplicado em look com `pieces` editado manualmente no Studio                  | Baixo         | Importer **substitui** `pieces` integralmente. Documentado no header do script. Backup antes de run real.                        |
| Documentos `look` em draft com `styling` divergem da versão publicada                 | Médio         | Importer aceita coluna opcional `target` (`published`/`draft`); se omitida, atualiza ambos via perspective `raw`.                |

---

## 8. Roteiro de fases

> Como ler: cada fase é auto-contida. Um agente executa uma fase lendo apenas:
> este PRD, AGENTS.md, a fase corrente e os arquivos listados em "Arquivos tocados".

### Status das fases

| Fase | Título                                              | Prioridade | Status |
| ---- | --------------------------------------------------- | ---------- | ------ |
| 0    | Schema `pieceType` + `look.pieces`                  | P0         | ⬜      |
| 1    | Importer de planilha (`scripts/import-pieces.ts`)   | P0         | ⬜      |
| 2    | Migração dos looks legados via importer             | P0         | ⬜      |
| 3    | Query, tipos e render no `LookViewer`               | P0         | ⬜      |
| 4    | Remoção do campo legado `styling`                   | P1         | ⬜      |

> **Estado atual do código (importante para o agente da Fase 0)**: existe o commit `c9823d6 feat(look): add pieces field with brand references`, que implementou uma versão anterior com `slot` como enum string e o helper `src/lib/slot-labels.ts`. Essa abordagem foi descartada nesta revisão da spec. **Sobrescrever** durante a Fase 0 (não reverter — é mais limpo seguir adiante com novos commits): deletar `src/lib/slot-labels.ts`, refazer o campo `pieces` no `look` schema com `slot: reference<pieceType>`, criar o schema `pieceType`.

---

### Fase 0 — Schema `pieceType` + `look.pieces` [P0]

**Objetivo**: criar o document type `pieceType`; refatorar o campo `pieces` em `look` para que `slot` seja `reference<pieceType>` em vez de string enum; popular os 4 `pieceType` iniciais.

**Pré-requisitos**: nenhum.

**Arquivos a criar:**
- `src/sanity/schemas/pieceType.ts` — `defineType` com:
  - `name`: `string`, required, descrição "Nome exibido no site (ex.: Camisa)".
  - `order`: `number`, descrição "Menor aparece primeiro no picker".
  - Preview: `title: name`, `subtitle: order`.
  - Ordering: por `order` asc.
- `scripts/seed-piece-types.ts` — script idempotente (`tsx`) que cria, se não existirem, os docs `pieceType` para `Camisa` (order 1), `Bermuda` (2), `Colar` (3), `Chapéu` (4). Match por `name` exato (case-sensitive). Usa `SANITY_API_WRITE_TOKEN`.

**Arquivos a modificar:**
- `src/sanity/schemas/index.ts` — registrar `pieceType`.
- `src/sanity/schemas/look.ts` — refatorar o field `pieces`:
  - `slot`: trocar de `string` com `options.list` para `reference` com `to: [{type: 'pieceType'}]`.
  - Manter `brands` igual (array de reference para `brand`, validation `min(1)`).
  - Atualizar `preview` do object: `select: { slotName: 'slot.name', brand0: 'brands.0.name', ... }` e `prepare` usando `slotName` como title.
  - Remover import de `@/lib/slot-labels`.

**Arquivos a deletar:**
- `src/lib/slot-labels.ts` — não é mais usado.

**Tarefas externas:**
1. `nvm use 24 && npm run typegen` — regenerar tipos.
2. `tsx scripts/seed-piece-types.ts --dry-run` então `tsx scripts/seed-piece-types.ts`.
3. Verificar manualmente no Studio: o tipo `Tipo de peça` aparece na barra; abrir um `look`, adicionar uma peça, escolher slot (picker mostra os 4 pieceTypes), adicionar marcas.

**Migração de conteúdo:** os 4 docs `pieceType` iniciais (via seed script).

**Critérios de aceitação:**
- [ ] `npm run typegen` gera o tipo `PieceType` e o tipo `Look` com `pieces[].slot` como reference.
- [ ] `tsc --noEmit` passa.
- [ ] Studio: campo `Peças` em `look` mostra picker de pieceType com 4 opções na ordem `Camisa, Bermuda, Colar, Chapéu`.
- [ ] Salvar com `brands` vazio gera warning de validação.

**Commits sugeridos:**
1. `feat(piece-type): add pieceType document schema`
2. `refactor(look): change pieces.slot to reference pieceType`
3. `chore(content): seed initial pieceType documents`

**Notas para o agente:**
- O commit prévio `c9823d6` introduziu `pieces` com slot enum + `slot-labels.ts`. **Sobrescrever**, não reverter.
- Não criar campo `slug` ou `value` no `pieceType`. `name` basta como label legível; o `_id` é a chave canônica.
- Schema minúsculo de propósito. Adicionar `description`, `image` etc. depois se precisar — YAGNI.

---

### Fase 1 — Importer de planilha [P0]

**Objetivo**: script `scripts/import-pieces.ts` que lê um CSV, resolve referências a `pieceType` e `brand`, e patcha `look.pieces`. Idempotente. Falha alto.

**Pré-requisitos**: Fase 0.

**Arquivos a criar:**
- `scripts/import-pieces.ts` — flags: `--dry-run`. Argumento posicional: path do CSV. Comportamento:
  1. Carrega `.env.local` (mesmo padrão de `migrate-look-photographers.ts`).
  2. Parseia CSV com `csv-parse/sync`. Colunas: `lookNumber`, `slot`, `brands`. Coluna opcional `target` (`published` | `draft`; vazio = ambos).
  3. Carrega tudo em memória: `pieceType[]`, `brand[]`, `look[]` (perspective `raw`).
  4. **Fase de resolução** (sem nenhum patch ainda):
     - Para cada linha: resolve `slot` por nome (case-insensitive sem acentos) contra `pieceType.name`. Resolve cada brand do split (`,`) por substring case-insensitive sem acentos contra `brand.name` e `brand.instagram`.
     - Resolve `lookNumber` para o(s) doc(s) correspondente(s).
     - Acumula erros: linha + motivo (slot não encontrado, brand ambígua, look não encontrado, etc.).
  5. Se houver qualquer erro: imprime o resumo e exit 1. Nenhum patch.
  6. Se OK: agrupa por `(_id, lookNumber)` e monta `pieces[]` com `_key` aleatório por entrada.
  7. Em `--dry-run`: imprime, por look, a lista de peças que seria escrita. Sem chamadas de patch.
  8. Em run real: para cada look, `client.patch(_id).set({ pieces: [...] }).commit()`. **Substitui** o array inteiro.

**Arquivos a modificar:**
- `package.json` — adicionar `csv-parse` em `devDependencies`.

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. `npm install --save-dev csv-parse`.
2. Criar um CSV pequeno de teste (`looks-test.csv` com 1-2 linhas) e rodar `--dry-run` para validar parsing e resolução.

**Migração de conteúdo:** nenhuma nesta fase (só infraestrutura).

**Critérios de aceitação:**
- [ ] `tsx scripts/import-pieces.ts looks-test.csv --dry-run` imprime peças propostas legíveis.
- [ ] CSV com slot inexistente: exit 1, mensagem aponta linha e valor.
- [ ] CSV com marca ambígua: exit 1, mensagem aponta linha e candidatos.
- [ ] Run real (CSV válido) patcha `pieces`. Re-rodar com mesmo CSV resulta em estado idêntico.
- [ ] `tsc --noEmit` passa (incluindo o script).

**Commits sugeridos:**
1. `feat(scripts): add import-pieces csv importer`

**Notas para o agente:**
- Reutilize o pattern de env loading e client de `scripts/migrate-look-photographers.ts`.
- Para `_key`: `Math.random().toString(36).slice(2, 14)` (mesmo padrão do `migrate-look-images.ts`).
- Normalização para match: lowercase + `String.prototype.normalize('NFD').replace(/[̀-ͯ]/g, '')`.
- Ambiguidade = mais de 1 candidato com substring match. Trate como erro, não pegue o primeiro.
- O importer **substitui** `pieces`; documentar no header do script (avisa o editor sobre edits manuais).

---

### Fase 2 — Migração dos looks legados via importer [P0]

**Objetivo**: popular `pieces` para os looks atuais (~Look 01) usando o importer da Fase 1. Não remove `styling`.

**Pré-requisitos**: Fase 1.

**Arquivos a criar:**
- `data/initial-pieces.csv` — CSV transcrito do `styling` legado:
  - Look 01 (published):
    - `01,Camisa,Melanina AM`
    - `01,Bermuda,Ateliê 1970`
    - `01,Colar,Ateliê Fernanda Menezes`
    - `01,Chapéu,Ateliê Fernanda Menezes`
  - Look 02 (draft com `styling: null`): pular, sem linha.

**Arquivos a modificar:** nenhum.

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. Backup: `npx sanity dataset export production backup-pre-pr-003.tar.gz`.
2. Confirmar com Wesley que os mappings legados→marcas no CSV estão corretos.
3. `tsx scripts/import-pieces.ts data/initial-pieces.csv --dry-run`. Wesley revisa.
4. `tsx scripts/import-pieces.ts data/initial-pieces.csv`.
5. Verificar no Studio: `pieces` populado, `styling` ainda existe.

**Migração de conteúdo:** Look 01 (published e draft, se aplicável).

**Critérios de aceitação:**
- [ ] Dry-run produz output legível.
- [ ] Run real popula `pieces` no Look 01 com 4 peças resolvidas.
- [ ] Re-rodar é no-op (estado idêntico).

**Commits sugeridos:**
1. `chore(content): backfill pieces for existing looks via csv importer`

**Notas para o agente:**
- Se houver dúvida sobre como uma string legada se traduz, **pergunte** ao Wesley, não invente.
- Não construa parser do `styling` antigo. O CSV é a fonte intencional dessa migração — Wesley transcreve manualmente, é uma vez só.

---

### Fase 3 — Query, tipos e render no `LookViewer` [P0]

**Objetivo**: o site passa a renderizar `pieces` em vez de `styling`.

**Pré-requisitos**: Fase 2.

**Arquivos a criar:**
- `src/components/LookPieces.tsx` — Server Component. Props: `pieces: AllLooksQueryResult[number]['pieces']`. Lógica:
  - Filtra peças sem `slot` (reference quebrada) ou sem brands válidas.
  - Se nada sobrar: retorna `null`.
  - Renderiza `<div>` com eyebrow `Styling`. Lista de linhas: `<SlotLabel> + <BrandList>`.
  - `SlotLabel`: `piece.slot?.name`.
  - `BrandList`: cada marca é `<a>` (com `instagram`) ou `<span>` (sem). Joinadas por ` · ` via `flatMap` com `React.Fragment`.
  - Estilo do link igual ao link do model no `LookViewer` atual.

**Arquivos a modificar:**
- `src/sanity/queries/looks.ts` — adicionar projeção:
  ```
  pieces[]{
    _key,
    slot->{ _id, name, order },
    brands[]->{ _id, name, instagram }
  }
  ```
  Manter `styling` na query ainda (removido só na Fase 4).
- `src/components/LookViewer.tsx` — substituir o bloco `{look.styling && ...}` por `<LookPieces pieces={look.pieces} />`.

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. `nvm use 24 && npm run typegen`.
2. `npm run dev`, abrir Look 01 no modal, validar critérios.

**Migração de conteúdo:** nenhuma.

**Critérios de aceitação:**
- [ ] Look 01 no modal: 4 linhas com as marcas como links clicáveis.
- [ ] Click em "Melanina AM" abre `https://instagram.com/melanina.am`.
- [ ] Look 02 (sem peças): seção `Styling` não renderiza.
- [ ] Marca sem `instagram`: nome como texto, não link.
- [ ] `tsc --noEmit` passa, `npm run build` passa.

**Commits sugeridos:**
1. `feat(looks): project pieces with pieceType and brand refs in groq query`
2. `feat(looks): render structured pieces with clickable brand links`

**Notas para o agente:**
- Eyebrow continua `Styling` por consistência editorial.
- Se `slot` for `null` (pieceType deletado), pula a peça inteira no render.
- `LookPieces` pode ser RSC (sem `"use client"`).

---

### Fase 4 — Remoção do campo legado `styling` [P1]

**Objetivo**: `styling` sai do schema, da query, dos tipos e do banco.

**Pré-requisitos**: Fase 3 em produção e validada por uma sessão editorial. Wesley dá ok explícito.

**Arquivos a criar:**
- `scripts/cleanup-look-styling.ts` — `client.patch(_id).unset(['styling']).commit()` para todos os `look`. Idempotente.

**Arquivos a modificar:**
- `src/sanity/schemas/look.ts` — remover field `styling`.
- `src/sanity/queries/looks.ts` — remover `styling` da projeção.

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. `tsx scripts/cleanup-look-styling.ts --dry-run`.
2. `tsx scripts/cleanup-look-styling.ts`.
3. `nvm use 24 && npm run typegen`.

**Critérios de aceitação:**
- [ ] `Look` type sem `styling`.
- [ ] `tsc --noEmit` passa.
- [ ] Studio sem campo `Styling`.
- [ ] `*[_type=='look'][0]{styling}` no Vision retorna `null`.

**Commits sugeridos:**
1. `chore(look): drop legacy styling field after pieces migration`
2. `chore(content): unset styling field in all look documents`

**Notas para o agente:**
- Não combinar com Fase 3 num mesmo PR. Janela de coexistência permite rollback via revert.

---

## 9. Glossário

- **Peça (piece)**: item do array `pieces` em um `look`. Tem um `slot` (reference) e `brands[]` (references).
- **pieceType**: schema novo. Document type que define os tipos de peça disponíveis (Camisa, Bermuda, …). Editável no Studio sem deploy.
- **Slot**: campo `pieces[].slot`, reference a um `pieceType`.
- **Brand**: documento já existente no Sanity (22 cadastrados). Reusado por referência.
- **Importer**: `scripts/import-pieces.ts`. Caminho principal de input para `pieces`. Lê CSV, resolve referências, patcha looks.
- **Falhar alto**: o importer aborta antes de qualquer patch se houver match não resolvido. Sem peças com `brands: []`.

---

## 10. Apêndice — Configuração

| Variável                 | Ambientes    | Valor                                                                                            |
| ------------------------ | ------------ | ------------------------------------------------------------------------------------------------ |
| `SANITY_API_WRITE_TOKEN` | local apenas | Token com permissão de write, usado pelos scripts (seed, importer, cleanup). Não exportar para Vercel. |

Sem novas envs em runtime. Sem novos webhooks. Sem mudanças de CORS.

**Formato esperado do CSV do importer:**

```csv
lookNumber,slot,brands
01,Camisa,Melanina AM
01,Bermuda,Ateliê 1970
01,Colar,"Ateliê Fernanda Menezes"
01,Chapéu,"Ateliê Fernanda Menezes"
02,Camisa,"Brand A, Brand B"
```

- Header obrigatório.
- `brands` aceita lista separada por vírgula; envolva em aspas se algum nome contém vírgula.
- Coluna opcional `target` (valores `published` ou `draft`); se ausente, atualiza ambos.

---

## 11. Fora de escopo (não agora)

- Filtros na home por marca ou por tipo de peça.
- Página dedicada por marca ou por pieceType.
- Validação custom anti-duplicação de slot (impedir dois `Camisa` no mesmo look).
- Ordenação automática de slots na UI (a ordem é a do array `pieces`).
- Suporte a "marca não cadastrada" (string livre como fallback). Editor cria o doc `brand` antes; reuso é a regra.
- Imagem do tipo de peça no Studio ou no site.
- Tracking analítico de clique em marca.
- Importer com modo `merge` (apenas append) — substituição é mais simples e idempotente.
- Exportador reverso (`pieces` → CSV). Útil no futuro; não agora.
- Sanity Canvas / parser LLM de texto livre como camada acima do importer. Pode entrar depois.

---

## 12. Trade-offs discutidos

**Forma do schema**
- **Opção A (escolhida)**: `slot: reference<pieceType>` com `pieceType` como document type. Editor adiciona tipo novo ("Bolsa", "Pulseira") sem deploy. Mais um doc type, mais um dereference por peça — desprezível no volume atual.
- **Opção B**: enum `string` com `options.list` no schema (versão anterior desta spec, parcialmente implementada em `c9823d6`). Rejeitada porque exige edit + deploy para cada tipo novo.
- **Opção C**: 4 campos hardcoded (`shirt`, `shorts`, `necklace`, `hat`). Rejeitada por rigidez total.
- **Opção D**: `slot: string` livre, sem catálogo. Rejeitada porque permite "Camisa" vs "camisa" vs "Camisas" inconsistente.

**Como representar a marca**
- **Opção A (escolhida)**: `reference<brand>`. 22 brands já existem; `brand` é a fonte canônica. Trocar o `@` da marca atualiza todos os looks.
- **Opção B**: par inline `{ name, instagram }`. Rejeitada — duplica fonte da verdade.

**Caminho principal de input**
- **Opção A (escolhida)**: planilha CSV via importer + Studio como fallback. Edit em lote (típico após desfile com 20-30 looks) é trivial num spreadsheet, doloroso clique a clique no Studio.
- **Opção B**: só Studio. Rejeitada — Wesley reportou explicitamente que a UX clique-a-clique é cansativa para múltiplos looks.
- **Opção C**: Sanity Canvas / parser LLM de texto livre. Rejeitada por agora — não-determinístico, beta, e exige review step. Pode entrar depois como camada acima do importer.

**Tratamento de match não resolvido no importer**
- **Opção A (escolhida)**: falhar alto. Exit 1, sem patch. Editor corrige CSV ou cria o doc faltante.
- **Opção B**: criar peça com `brands: []` e logar (versão anterior desta spec). Rejeitada — produz estado parcial no banco que precisa de cleanup manual depois. Falhar cedo é mais barato.

**Substituição vs merge no importer**
- **Opção A (escolhida)**: importer substitui `pieces` integralmente por look. Idempotente. Re-rodar = mesmo estado.
- **Opção B**: append/merge. Rejeitada — duplicaria peças em re-runs, exigiria diff lógico complexo.

**Migração do legado**
- **Opção A (escolhida)**: transcrever manualmente os looks atuais para um CSV e rodar o importer. Total: ~4 linhas.
- **Opção B**: parser dedicado de strings legadas (`"Camisa: Melanina"`, `"Colares e chapéu: ..."` etc.). Rejeitada — overengineering para uma punhado de strings; o importer já resolve.

**Render: clicar no nome ou em um ícone**
- **Opção A (escolhida)**: o próprio nome da marca é o link. Padrão do `PhotographerCredit` e do link do model; sem ruído visual.
- **Opção B**: nome + ícone Instagram ao lado. Rejeitada — adiciona elemento visual sem clareza extra.
