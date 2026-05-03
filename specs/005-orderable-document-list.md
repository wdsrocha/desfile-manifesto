# PRD 005 — Ordenação de looks com `@sanity/orderable-document-list` + remoção de campos `order` legados

> Status: Draft
> Autor: Wesley Rocha
> Data: 2026-05-03
> Audiência: Wesley (decisor) e agentes de codificação executando fases isoladas

---

## 1. Sumário executivo

O campo `order: number` existe hoje em cinco schemas (`look`, `person`, `brand`, `creditGroup`, `pieceType`) como mecanismo de ordenação manual. A estratégia adotada é simples e direta: apenas `look` recebe o plugin `@sanity/orderable-document-list` (drag-and-drop); todos os outros tipos passam a usar ordenação lexicográfica e o campo `order` é simplesmente removido. O campo `lookNumber` — que hoje serve de chave de ordenação **e** de identificador editorial — é removido junto.

**Estado final:**
- `look` é ordenado por `orderRank` (string LexoRank). Sem `lookNumber`. Wesley arrasta looks no Studio para definir a ordem de exibição na grade do site.
- `creditGroup`, `pieceType`, `person`, `brand`: sem campo `order`. Ordenação natural/lexicográfica (por nome, título, stageName — decidido por tipo).
- O importer de peças (`scripts/import-pieces.ts`) passa a identificar o look pelo nome do modelo (`modelName`) em vez de `lookNumber`.

---

## 2. Decisões já tomadas (não revisitar sem justificativa)

| Decisão | Valor |
| ------- | ----- |
| Plugin para ordenação de looks | `@sanity/orderable-document-list`. Campo gerado: `orderRank: string`. |
| Plugin para outros tipos | Não. Ordem lexicográfica é suficiente para `creditGroup`, `pieceType`, `person`, `brand`. |
| Remoção de `lookNumber` | Completa. Usado apenas para ordenação e comunicação interna; ambos resolvidos por `orderRank` + nome do modelo. |
| Identificador no CSV do importer | `modelName` (match por `look.model.name`, case-insensitive sem acentos). Quebra compatibilidade com CSVs anteriores — documentado no header do script. |
| `data/initial-pieces.csv` | Atualizar coluna `lookNumber` → `modelName` como parte da Fase 1. |
| Ordem de `creditGroup` | Por `title asc`. |
| Ordem de `pieceType` | Por `name asc`. |
| Ordem de `person` | Por `stageName asc` dentro de cada role (query já filtra por role). |
| Ordem de `brand` | Por `name asc` (inalterada — query já faz isso). |

---

## 3. Arquitetura / modelo mental

### Fluxo de ordenação de looks (pós-migração)

```
Studio:
  OrderableDocumentListDeskItem para 'look'
  └─ Wesley arrasta → Sanity escreve orderRank no documento

GROQ (allLooksQuery):
  *[_type == "look"] | order(orderRank asc) { ... }
  ↑ não tem mais "lookNumber"

Site:
  LooksSection recebe looks já ordenados pelo GROQ
  Label de acessibilidade = model.name (já era o preferido;
  o fallback numérico baseado em lookNumber some)
```

### Impacto no importer de peças

```
CSV antes (PRD 003):
  lookNumber, slot, brands
  01, Camisa, Melanina AM

CSV depois:
  modelName, slot, brands
  Dacota, Camisa, Melanina AM

scripts/import-pieces.ts:
  looksByNumber → looksByModelName
  match: look.model.name, case-insensitive sem acentos
  (mesma lógica de normalização já existente no script)
```

### Fluxo de remoção dos outros campos `order`

```
Para cada tipo (creditGroup, pieceType, person, brand):
  1. Remover field do schema
  2. Atualizar query GROQ (se usava order(order asc))
  3. Script de cleanup: unset(['order']) em todos os docs
  4. npm run typegen
```

---

## 4. Convenções

- `orderRank` é **sempre oculto** (`hidden: true`) — editor não digita, só arrasta.
- A configuração de `OrderableDocumentListDeskItem` fica em `src/sanity/structure.ts`, substituindo o item automático de `look` gerado por `S.documentTypeListItems()`.
- O importer usa `modelName` como chave no CSV. Se dois looks tiverem o mesmo nome de modelo, o importer **falha alto** (ambiguidade — mesmo padrão já adotado para brand match).
- Scripts de cleanup seguem o padrão dos existentes: `--dry-run`, `perspective: raw`, `SANITY_API_WRITE_TOKEN`.

---

## 5. Estratégia de ambientes

Sem mudanças. Dataset `production` único para todos os ambientes (decisão PRD 001). Scripts de migração rodam localmente com `SANITY_API_WRITE_TOKEN`.

---

## 6. Restrições técnicas / limites externos

- **Versão do plugin**: `@sanity/orderable-document-list@^1` é compatível com `sanity@^5`. Confirmar no momento da instalação.
- **`orderRank` em docs existentes**: novos docs criados pelo Studio recebem `orderRank` automaticamente. Docs existentes precisam do script de seed — deve rodar **antes** de trocar a query GROQ para `order(orderRank asc)`.
- **LooksSection.tsx**: usa `look.lookNumber` como fallback para aria-label e alt text. Após remoção, o fallback numérico baseado em `lookNumber` é removido; o fallback passa a ser texto genérico ("Abrir look").
- **TypeGen**: rodar com Node 24 após cada mudança de schema ou query.
- **Importer**: a coluna do CSV muda de `lookNumber` para `modelName`. Qualquer CSV gerado antes desta migração precisa ser atualizado antes de ser re-executado.

---

## 7. Riscos e mitigações

| Risco | Probabilidade | Mitigação |
| ----- | ------------- | --------- |
| Dois looks com o mesmo nome de modelo no CSV | Baixo | Importer falha alto com mensagem clara. Usar nome mais específico no CSV ou editar diretamente no Studio. |
| Looks sem modelo cadastrado ficam sem identificador no CSV | Médio | Importer reporta erro na resolução. Editor cadastra o modelo antes de rodar. |
| Docs antigos sem `orderRank` aparecem fora de ordem antes do seed | Alto | Seed roda antes de qualquer mudança na query GROQ. |
| CSS/layout depende de lookNumber para algum atributo `data-*` | Baixo | Nenhum uso encontrado no código. |

---

## 8. Roteiro de fases

> Como ler: cada fase é auto-contida. Um agente executa uma fase lendo apenas:
> este PRD, AGENTS.md, a fase corrente e os arquivos listados em "Arquivos tocados".

### Status das fases

| Fase | Título | Prioridade | Status |
| ---- | ------ | ---------- | ------ |
| 0 | Instalação do plugin | P0 | ⬜ |
| 1 | Migração de `look`: `orderRank` + remoção de `lookNumber` | P0 | ⬜ |
| 2 | Remoção de `order` dos tipos restantes | P1 | ⬜ |

---

### Fase 0 — Instalação do plugin [P0]

**Objetivo**: instalar `@sanity/orderable-document-list` e confirmar que o Studio abre sem erros.

**Pré-requisitos**: nenhum.

**Arquivos a modificar:**
- `package.json` — `npm install @sanity/orderable-document-list`.

**Tarefas externas:**
1. `npm install @sanity/orderable-document-list`.
2. `npm run dev` — abrir o Studio e confirmar sem erros no console.

**Critérios de aceitação:**
- [ ] `npm run dev` (Studio) sobe sem erros.
- [ ] `tsc --noEmit` passa.

**Commits sugeridos:**
1. `chore(studio): install orderable-document-list plugin`

---

### Fase 1 — Migração de `look`: `orderRank` + remoção de `lookNumber` [P0]

**Objetivo**: substituir `lookNumber` por `orderRank` no schema de `look`; atualizar query, tipos, componentes e o importer de peças.

**Pré-requisitos**: Fase 0.

**Arquivos a criar:**
- `scripts/seed-order-rank-looks.ts` — script idempotente (`--dry-run`):
  - Carrega todos os docs `look` (`perspective: raw`) ordenados por `lookNumber asc` (enquanto o campo ainda existe no banco).
  - Para cada look sem `orderRank`, atribui um rank usando `client.patch(_id).setIfMissing({ orderRank: <rank> }).commit()`.
  - Usa `initialOrderRankFor('look')` e `nextOrderRankPair()` da API pública do plugin para gerar os ranks em sequência.
  - Referência: [docs do plugin para seed](https://www.npmjs.com/package/@sanity/orderable-document-list).

**Arquivos a modificar:**
- `src/sanity/schemas/look.ts`:
  - Importar `defineOrderableField` (ou `orderRankField`) do plugin e adicionar o campo `orderRank` (hidden).
  - Remover o field `lookNumber`.
  - Atualizar `orderings`: remover `lookNumberAsc`, adicionar ordering por `orderRank asc`.
  - Atualizar `preview`: `select.title` deixa de ser `lookNumber`; passa a ser `model.name` ou `model.stageName` (o que existir). Subtitle pode ser `images.0` (media).

- `src/sanity/structure.ts`:
  - Importar `OrderableDocumentListDeskItem` do plugin.
  - Substituir o item automático de `look` (que hoje vem de `S.documentTypeListItems()`) por um item explícito usando `OrderableDocumentListDeskItem(S, { type: 'look', title: 'Looks' })`.

- `src/sanity/queries/looks.ts`:
  - Remover `lookNumber` da projeção.
  - Trocar `order(lookNumber asc)` por `order(orderRank asc)`.

- `src/components/LooksSection.tsx`:
  - Remover o uso de `look.lookNumber` (linha que faz `look.lookNumber ?? String(i + 1)...`).
  - O aria-label e alt text passam a usar apenas `modelName` quando disponível, ou texto genérico ("Abrir look", "Look") como fallback.

- `scripts/import-pieces.ts`:
  - Renomear coluna `lookNumber` → `modelName` no tipo `CsvRow`.
  - Atualizar a lógica de resolução: em vez de `looksByNumber` (map por `lookNumber`), usar `looksByModelName` (map por `look.model.name` normalizado).
  - Atualizar header do script com a nova coluna.
  - Falhar alto se dois looks tiverem o mesmo `model.name` normalizado (ambiguidade).

- `data/initial-pieces.csv`:
  - Atualizar header: `lookNumber,slot,brands` → `modelName,slot,brands`.
  - Atualizar valor da coluna (ex.: `01` → nome do modelo do Look 01).

**Tarefas externas:**
1. `tsx scripts/seed-order-rank-looks.ts --dry-run` — revisar ranks propostos.
2. `tsx scripts/seed-order-rank-looks.ts` — seed em produção.
3. `nvm use 24 && npm run typegen`.
4. `npm run dev` — abrir Studio, confirmar drag-and-drop na lista de looks.
5. Verificar no site: grade de looks em ordem correta, sem erros de acessibilidade.
6. Script de cleanup pós-validação: `scripts/cleanup-look-look-number.ts` — `unset(['lookNumber'])` em todos os docs, rodar após confirmar que tudo funciona.

**Critérios de aceitação:**
- [ ] Studio: lista de looks exibe drag-and-drop; arrastar muda a ordem na grade do site após revalidação.
- [ ] `tsc --noEmit` passa.
- [ ] `npm run build` passa.
- [ ] `allLooksQuery` não projeta `lookNumber`; tipo gerado não tem `lookNumber`.
- [ ] `tsx scripts/import-pieces.ts data/initial-pieces.csv --dry-run` funciona com a coluna `modelName`.
- [ ] CSV com nome de modelo inexistente: exit 1, mensagem clara.
- [ ] Studio: preview do look exibe nome do modelo como título.

**Commits sugeridos:**
1. `feat(look): add orderRank field via orderable-document-list`
2. `chore(studio): configure orderable list for look documents`
3. `chore(content): seed orderRank for existing look documents`
4. `refactor(look): remove lookNumber from schema, query and components`
5. `refactor(scripts): update import-pieces to identify looks by model name`
6. `chore(content): unset lookNumber from all look documents`

**Notas para o agente:**
- O seed de `orderRank` deve rodar **antes** de trocar a query para `order(orderRank asc)`. A sequência correta é: seed → typegen → trocar query → testar.
- `LooksSection.tsx` usa `look.lookNumber` apenas como fallback (string de acessibilidade quando não há nome de modelo). Remover a variável `number` e simplificar as strings de fallback para `"Abrir look"` / `"Look"`.
- O campo `orderRank` deve ser `hidden: true` no schema para não aparecer como campo editável no formulário do look.
- Confirmar no [repositório do plugin](https://www.npmjs.com/package/@sanity/orderable-document-list) a API exata para `initialOrderRankFor` antes de escrever o seed script — a API pode ter mudado.

---

### Fase 2 — Remoção de `order` dos tipos restantes [P1]

**Objetivo**: remover o campo `order: number` de `creditGroup`, `pieceType`, `person` e `brand`; atualizar as queries que o usavam para ordenação lexicográfica.

**Pré-requisitos**: nenhum (independente da Fase 1).

**Ordenação resultante por tipo:**

| Tipo | Query GROQ resultante | Mudança |
| ---- | --------------------- | ------- |
| `creditGroup` | `order(title asc)` | era `order(order asc)` |
| `pieceType` | `order(name asc)` | sem query direta; Studio ordering muda |
| `person` (modelos) | `order(stageName asc)` | era `order(order asc, stageName asc)` |
| `person` (produção) | `order(stageName asc)` | era `order(order asc)` |
| `brand` | sem mudança | query já era `order(name asc)` |

**Arquivos a modificar:**
- `src/sanity/schemas/creditGroup.ts` — remover field `order`; atualizar `orderings` para `title asc`.
- `src/sanity/schemas/pieceType.ts` — remover field `order`; atualizar `orderings` para `name asc`.
- `src/sanity/schemas/person.ts` — remover field `order`; simplificar `orderings` (remover critério `order`).
- `src/sanity/schemas/brand.ts` — remover field `order`; remover ordering `Manual (ordem asc)` (manter só `Nome (A-Z)`).
- `src/sanity/queries/credits.ts` — `order(order asc)` → `order(title asc)`.
- `src/sanity/queries/people.ts` — `order(order asc, stageName asc)` → `order(stageName asc)`; `order(order asc)` → `order(stageName asc)`.

**Arquivos a criar:**
- `scripts/cleanup-order-fields.ts` — script único que faz `unset(['order'])` em todos os docs de `creditGroup`, `pieceType`, `person` e `brand`. Um patch por tipo, idempotente. Suporta `--dry-run`.

**Tarefas externas:**
1. `tsx scripts/cleanup-order-fields.ts --dry-run`.
2. `tsx scripts/cleanup-order-fields.ts`.
3. `nvm use 24 && npm run typegen`.
4. Confirmar no Studio que os campos `Ordem` sumiram dos formulários.

**Critérios de aceitação:**
- [ ] Nenhum schema com field `order`.
- [ ] `tsc --noEmit` passa.
- [ ] `*[_type in ["creditGroup","pieceType","person","brand"]][0]{order}` no Vision retorna `null`.
- [ ] Studio sem campo `Ordem` em nenhum desses tipos.

**Commits sugeridos:**
1. `chore(schemas): remove manual order field from creditGroup, pieceType, person, brand`
2. `refactor(queries): use lexicographic ordering after removing order fields`
3. `chore(content): unset order field from all affected documents`

---

## 9. Glossário

- **`orderRank`**: campo `string` com rank LexoRank. Permite inserção entre itens sem renumerar. Gerado e mantido pelo plugin `@sanity/orderable-document-list`. Opaco — não exibido ao editor.
- **LexoRank**: algoritmo de rank fracionário (inserir entre "a" e "b" gera "am"). Sem colisões, sem renumerações.
- **`OrderableDocumentListDeskItem`**: componente do plugin que adiciona drag-and-drop à lista de documentos no Studio.
- **`initialOrderRankFor(type)`**: helper do plugin que gera o primeiro rank para um tipo.
- **`setIfMissing`**: operação de patch do Sanity que só escreve se o campo ainda não existe — garante idempotência no seed.

---

## 10. Apêndice — Configuração

| Variável | Ambientes | Valor |
| -------- | --------- | ----- |
| `SANITY_API_WRITE_TOKEN` | local apenas | Token com permissão de write, usado pelos scripts de seed e cleanup. |

Sem novas envs em runtime. Sem novos webhooks. Sem mudanças de CORS.

**Formato do CSV do importer após Fase 1:**

```csv
modelName,slot,brands
Dacota,Camisa,Melanina AM
Dacota,Bermuda,Ateliê 1970
```

---

## 11. Fora de escopo (não agora)

- Ordenação manual de marcas no site (decisão: ordem alfabética permanece).
- Ordenação manual de grupos de créditos (ordem alfabética por título é suficiente).
- Ordenação de `look.pieces[]` dentro de um look (arrays do Sanity já têm drag-and-drop nativo).
- Página ou filtro por look no site.

---

## 12. Trade-offs discutidos

**Plugin apenas para `look` vs plugin para todos os tipos**
- **Opção A (escolhida)**: plugin só para `look`; resto usa ordem lexicográfica. Simples: sem drag-and-drop onde não é necessário.
- **Opção B**: plugin para todos os tipos com `order`. Mais consistente na UX do Studio, mas adiciona complexidade de setup e seed sem necessidade editorial real.

**Remoção de `lookNumber` vs mantê-lo como label**
- **Opção A (escolhida)**: remover completamente. A identidade editorial do look já é o nome do modelo ("o look da Dacota"), não o número.
- **Opção B**: manter como label livre opcional. Cria confusão entre o número exibido e a posição real na grade (que passa a ser controlada pelo `orderRank`). Rejeitada.

**Identificador no CSV do importer: `modelName` vs `_id`**
- **Opção A (escolhida)**: `modelName`. Legível num spreadsheet; o editor sabe qual look é qual pelo nome do modelo.
- **Opção B**: `_id` do documento. Inequívoco, mas ilegível. Inapropriado para um CSV editorial.

**Um script de cleanup por tipo vs script único**
- **Opção A (escolhida)**: script único `cleanup-order-fields.ts` para os quatro tipos sem plugin. Menos arquivos, mesma idempotência.
- **Opção B**: um script por tipo (padrão das migrações anteriores). Mais verboso sem ganho real quando todos fazem a mesma operação.
