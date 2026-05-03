# PRD 005 — Migração de `order: number` para `@sanity/orderable-document-list`

> Status: Draft
> Autor: Wesley Rocha
> Data: 2026-05-03
> Audiência: Wesley (decisor) e agentes de codificação executando fases isoladas

---

## 1. Sumário executivo

O padrão atual de ordenação manual — um campo `order: number` setado à mão pelo editor — é frágil: inserir um item entre dois existentes exige renumerar, duplicatas passam despercebidas e não há feedback visual de ordem no Studio. O plugin `@sanity/orderable-document-list` substitui esse padrão por drag-and-drop com rank lexicográfico (`orderRank: string`), sem renumeração.

**Estado final**: os document types que hoje dependem de `order: number` para ordenação no site passam a usar `orderRank`, drag-and-drop no Studio e `order(orderRank asc)` no GROQ. O campo `order: number` é removido dos schemas e dos documentos. `look` fica de fora (ver §12).

---

## 2. Diagnóstico — estado atual

### 2.1 Tipos com `order: number`

| Tipo          | Campo `order` no schema | Usado em GROQ?             | Site depende da ordem?       |
| ------------- | ----------------------- | -------------------------- | ---------------------------- |
| `creditGroup` | ✅ sim                  | ✅ `order(order asc)`      | ✅ sim (seção de créditos)   |
| `pieceType`   | ✅ sim                  | ❌ (só Studio ordering)    | ⚠️ via picker, indiretamente |
| `person`      | ✅ sim                  | ✅ `order(order asc, ...)` | ✅ sim (modelos, produção)   |
| `brand`       | ✅ sim                  | ❌ query usa `name asc`    | ❌ não (ordem é alfabética)  |

### 2.2 `look` — padrão diferente

`look` usa `lookNumber: string` ("01", "02") como chave de ordem **e** de exibição ("Look 01"). A query faz `order(lookNumber asc)`. Não é `order: number` — é uma chave semântica. Tratado separadamente em §11 (fora de escopo).

### 2.3 Por que `brand.order` não está sendo usado

A query `allBrandsQuery` ordena por `name asc`, ignorando o campo `order`. O campo existe no schema mas nunca foi lido pela query. Se a intenção futura for orderação manual de marcas, a migração faz sentido; se a intenção for manter alfabético, o campo pode simplesmente ser removido sem o plugin.

---

## 3. Decisões já tomadas (não revisitar sem justificativa)

| Decisão                        | Valor                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| Plugin escolhido               | `@sanity/orderable-document-list` (oficial Sanity, sem dependências extras, API estável).          |
| Campo gerado pelo plugin       | `orderRank: string` (LexoRank). Oculto na UI — o editor não vê, só arrasta.                       |
| Ordem de migração              | `creditGroup` → `pieceType` → avaliar `person` → decidir `brand`. Cada tipo em fase separada.     |
| `person`: não migrar agora     | Complexidade alta (ver §4.3). Fica como `order: number` até decisão explícita.                     |
| `brand`: não migrar agora      | `order` já é ignorado na query. Remover o campo (sem plugin) é suficiente — ver §11.              |
| `look`: fora de escopo         | `lookNumber` é semântico e funciona bem. Ver §11.                                                  |
| Migração de conteúdo           | Script one-shot: lê os docs ordenados pelo `order` atual, atribui `orderRank` em sequência.       |
| Remoção do campo legado        | `order` é removido do schema e dos documentos somente após a migração de `orderRank` estar validada. |

---

## 4. Arquitetura / modelo mental

### 4.1 Como o plugin funciona

```
Schema:
  creditGroup {
    orderRank: string   ← gerado pelo plugin (hidden)
    title: string
    order: number       ← campo legado, removido na fase final
    ...
  }

Studio (structure.ts):
  S.listItem()
    .child(
      OrderableDocumentListDeskItem(S, { type: 'creditGroup', ... })
    )
  ↑ substitui S.documentTypeListItems() automático

GROQ:
  *[_type == "creditGroup"] | order(orderRank asc) { ... }
  ↑ substitui order(order asc)
```

### 4.2 Fluxo de migração por tipo

```
1. Instalar plugin + adicionar orderRank ao schema
   └─ Studio exibe a lista com drag-and-drop (mas sem ranks ainda)

2. Rodar script de migração de conteúdo
   └─ Lê docs ordenados por order asc → atribui orderRank via setIfMissing

3. Atualizar GROQ query: order(order asc) → order(orderRank asc)
   └─ Rodar typegen

4. Validar no site + Studio

5. Remover campo order do schema
   └─ Rodar script de cleanup para unset order nos documentos
   └─ Rodar typegen
```

### 4.3 Complexidade por tipo

**`creditGroup`** — Simples. ~5 documentos. Ordem linear. Sem complicadores. Fase de referência.

**`pieceType`** — Simples. 4 documentos. Sem query GROQ direta (só Studio). Após migração, o picker de `slot` no Studio usará `orderRank` para ordenar o dropdown — mas isso requer configurar `orderBy` no campo `reference` de `look.pieces[].slot`.

**`person`** — Complexo por dois motivos:
1. A query atual mistura papéis: `order(order asc, stageName asc)`. Um único `orderRank` global ordena todos os `person` sem distinção de papel — o editor teria que manter a ordem global manualmente em vez de por papel.
2. O site consome `person` em contextos separados: modelos têm sua lista, produção executiva tem a sua. A ordem relevante é **dentro do papel**, não global.

Alternativa para `person`: criar uma `OrderableDocumentListDeskItem` **por papel** no Studio (uma lista arrastável para modelos, outra para fotógrafos, etc.) e manter `orderRank` único mas garantindo que o editor só arrasta dentro do papel. Isso resolve o problema, mas aumenta a complexidade de configuração da estrutura.

**`brand`** — Sem valor imediato. A query não usa `order`. Se a decisão for manter ordem alfabética, o campo `order` pode ser simplesmente removido (sem script de migração, sem plugin). Se a decisão for habilitar ordem manual para marcas no site, aí sim o plugin se aplica.

---

## 5. Convenções

- O campo `orderRank` é **sempre oculto** (`hidden: true`) no schema — o editor não digita, só arrasta.
- A configuração do `OrderableDocumentListDeskItem` fica em `src/sanity/structure.ts`.
- GROQ usa `order(orderRank asc)` como critério principal. Critérios secundários (`stageName asc` etc.) são mantidos para desempate enquanto `orderRank` não cobre todos os docs.
- Script de seed de `orderRank`: `scripts/seed-order-rank-<type>.ts`. Um por tipo. Idempotente (`setIfMissing`).
- Após remover `order`, rodar `npm run typegen`.

---

## 6. Restrições técnicas / limites externos

- **Versão do plugin**: verificar compatibilidade com `sanity@^5` antes de instalar (`@sanity/orderable-document-list@^1`).
- **`orderRank` em pickers de referência**: o picker de `reference` no Studio ordena documentos pelo `orderings` definido no schema do tipo referenciado, não pelo `orderRank` — a menos que o ordering padrão do tipo use `orderRank`. Isso afeta o picker de `slot` em `look.pieces`: configurar `orderings` do `pieceType` para usar `orderRank asc`.
- **Sem impacto no bundle do cliente**: `orderRank` é consultado pelo Sanity client; o campo é uma string opaca. Zero dependência nova no front.
- **TypeGen**: rodar com Node 24 após cada mudança de schema ou query.

---

## 7. Riscos e mitigações

| Risco                                                                      | Probabilidade | Mitigação                                                                                                   |
| -------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------- |
| Docs criados após a migração não têm `orderRank` (aparecem no topo/fundo)  | Alto          | O plugin adiciona `orderRank` automaticamente em novos docs criados pelo Studio. Script de seed é one-shot. |
| Picker de `slot` no Studio não respeita `orderRank`                        | Médio         | Atualizar `orderings` do `pieceType` para usar `orderRank asc` como ordering padrão.                        |
| `person` com ordem errada após migração global                             | Alto (se migrado sem lista por papel) | Deixar `person` fora do escopo até definir a estrutura de listas por papel.       |
| Query retorna `null` para `orderRank` em docs antigos (antes do seed)      | Médio         | Rodar o seed **antes** de trocar a query GROQ. Manter `order` como fallback na query durante a transição.   |
| Plugin incompatível com a versão atual do Sanity Studio                    | Baixo         | Verificar versão antes de instalar. O plugin é oficial e segue o ciclo do Studio.                           |

---

## 8. Roteiro de fases

> Como ler: cada fase é auto-contida. Um agente executa uma fase lendo apenas:
> este PRD, AGENTS.md, a fase corrente e os arquivos listados em "Arquivos tocados".

### Status das fases

| Fase | Título                                                      | Prioridade | Status |
| ---- | ----------------------------------------------------------- | ---------- | ------ |
| 0    | Instalação do plugin e setup base                           | P0         | ⬜      |
| 1    | Migração de `creditGroup`                                   | P0         | ⬜      |
| 2    | Migração de `pieceType`                                     | P0         | ⬜      |
| 3    | Remoção de `brand.order` (sem plugin)                       | P1         | ⬜      |
| 4    | Migração de `person` (requer decisão editorial prévia)      | P2         | ⬜      |

---

### Fase 0 — Instalação do plugin e setup base [P0]

**Objetivo**: instalar `@sanity/orderable-document-list`, confirmar compatibilidade, expandir `structure.ts` para receber itens ordenáveis por tipo.

**Pré-requisitos**: nenhum.

**Arquivos a modificar:**
- `package.json` — `npm install @sanity/orderable-document-list`.
- `src/sanity/structure.ts` — expandir de `S.documentTypeListItems()` implícito para itens explícitos por tipo, preparando os slots onde `OrderableDocumentListDeskItem` será inserido nas fases seguintes. Por ora, manter comportamento idêntico ao atual.

**Arquivos a criar:** nenhum.

**Tarefas externas:**
1. `npm install @sanity/orderable-document-list`.
2. Verificar que Studio abre sem erros.

**Critérios de aceitação:**
- [ ] `npm run dev` (Studio) abre sem erros de importação.
- [ ] `tsc --noEmit` passa.
- [ ] Nenhuma mudança de comportamento visível.

**Commits sugeridos:**
1. `chore(studio): install orderable-document-list plugin`
2. `refactor(studio): expand structure to explicit per-type items`

---

### Fase 1 — Migração de `creditGroup` [P0]

**Objetivo**: substituir `order: number` por `orderRank` em `creditGroup`. Tipo mais simples, serve de referência para as fases seguintes.

**Pré-requisitos**: Fase 0.

**Arquivos a modificar:**
- `src/sanity/schemas/creditGroup.ts`:
  - Adicionar `orderRank: string` com `hidden: true` via helper `defineOrderableField()` do plugin.
  - Manter `order: number` temporariamente (removido na etapa final).
  - Atualizar `orderings`: adicionar `orderRank asc` como ordering padrão.
- `src/sanity/structure.ts` — substituir o item de `creditGroup` por `OrderableDocumentListDeskItem(S, { type: 'creditGroup', ... })`.
- `src/sanity/queries/credits.ts` — trocar `order(order asc)` por `order(orderRank asc)`.

**Arquivos a criar:**
- `scripts/seed-order-rank-credit-group.ts` — script idempotente: busca `*[_type == "creditGroup"] | order(order asc)`, atribui `orderRank` em sequência usando `setIfMissing`. Usa `orderedDocumentListDragHandle` do plugin para gerar os ranks (ou `initialOrderRankFor()` da API do plugin).

**Tarefas externas:**
1. `tsx scripts/seed-order-rank-credit-group.ts --dry-run` → revisar output.
2. `tsx scripts/seed-order-rank-credit-group.ts`.
3. Verificar no Studio: lista de `creditGroup` exibe drag-and-drop; arrastar muda a ordem.
4. Verificar no site: seção de créditos em ordem correta.
5. `nvm use 24 && npm run typegen`.

**Etapa final (após validação):**
- Remover `order` de `creditGroup.ts`.
- Criar `scripts/cleanup-credit-group-order.ts` — `unset(['order'])` em todos os docs.
- Rodar cleanup + typegen.

**Critérios de aceitação:**
- [ ] Drag-and-drop funcional no Studio para `creditGroup`.
- [ ] Site renderiza grupos de créditos na ordem arrastada.
- [ ] Re-rodar seed é no-op.
- [ ] `tsc --noEmit` passa.
- [ ] Studio sem campo `order` visível após etapa final.

**Commits sugeridos:**
1. `feat(credit-group): add orderRank field via orderable-document-list`
2. `chore(content): seed orderRank for creditGroup documents`
3. `chore(credit-group): drop legacy order field`

---

### Fase 2 — Migração de `pieceType` [P0]

**Objetivo**: substituir `order: number` por `orderRank` em `pieceType`, e garantir que o picker de `slot` no Studio respeite a nova ordem.

**Pré-requisitos**: Fase 1 (padrão estabelecido).

**Atenção específica**: `pieceType` não tem query GROQ direta — mas o picker de `slot` em `look.pieces` usa o `orderings` do schema para ordenar os documentos no dropdown do Studio. É preciso atualizar o ordering padrão para `orderRank asc`, caso contrário o picker continuará ordenando pelo campo antigo (ou por `_createdAt`).

**Arquivos a modificar:**
- `src/sanity/schemas/pieceType.ts`:
  - Adicionar `orderRank` via helper do plugin.
  - Atualizar `orderings` padrão para `orderRank asc`.
  - Manter `order: number` temporariamente.
- `src/sanity/structure.ts` — `OrderableDocumentListDeskItem` para `pieceType`.

**Arquivos a criar:**
- `scripts/seed-order-rank-piece-type.ts` — mesmo padrão da Fase 1.

**Tarefas externas:**
1. Seed + validação no Studio (picker de slot mostra Camisa → Bermuda → Colar → Chapéu).
2. Etapa final: remover `order`, cleanup script, typegen.

**Critérios de aceitação:**
- [ ] Drag-and-drop funcional para `pieceType` no Studio.
- [ ] Picker de slot em `look` exibe tipos na ordem arrastada.
- [ ] `tsc --noEmit` passa.

**Commits sugeridos:**
1. `feat(piece-type): add orderRank field via orderable-document-list`
2. `chore(content): seed orderRank for pieceType documents`
3. `chore(piece-type): drop legacy order field`

---

### Fase 3 — Remoção de `brand.order` (sem plugin) [P1]

**Objetivo**: remover o campo `order: number` de `brand`, que existe no schema mas nunca foi lido pela query do site (a query usa `order(name asc)`).

**Pré-requisitos**: nenhum (independente das fases anteriores).

**Decisão prévia necessária**: Wesley confirma que a ordenação de marcas no site permanecerá alfabética. Se em algum momento quiser ordem manual, essa fase vira uma migração com o plugin — não simplesmente remoção.

**Arquivos a modificar:**
- `src/sanity/schemas/brand.ts` — remover field `order` e o ordering `Manual (ordem asc)`.

**Arquivos a criar:**
- `scripts/cleanup-brand-order.ts` — `unset(['order'])` em todos os docs `brand`.

**Tarefas externas:**
1. `tsx scripts/cleanup-brand-order.ts --dry-run`.
2. `tsx scripts/cleanup-brand-order.ts`.
3. `nvm use 24 && npm run typegen`.

**Critérios de aceitação:**
- [ ] Schema e tipo gerado sem campo `order`.
- [ ] Studio sem campo `Ordem` visível em brand.
- [ ] `*[_type=="brand"][0]{order}` no Vision retorna `null`.

**Commits sugeridos:**
1. `chore(brand): remove unused order field`
2. `chore(content): unset order field in all brand documents`

---

### Fase 4 — Migração de `person` [P2]

**Pré-requisito**: decisão editorial prévia sobre a estrutura de listas no Studio.

**Por que é diferente**: `person` agrupa múltiplos papéis (model, photographer, production, volunteer, etc.). A ordenação atual é `role + order + stageName` — ou seja, a ordem é **dentro de cada papel**. Um `orderRank` global único não captura isso.

**Duas opções a decidir antes de executar:**

**Opção A — Lista única global (simples, menos fiel)**
- Uma lista arrastável de todos os `person` juntos.
- O editor arrasta para posicionar a ordem global.
- A query continua filtrando por role, mas a "posição" dentro de cada papel vira implícita pela posição global.
- Risco: editor pode acidentalmente embaralhar a ordenação entre papéis.

**Opção B — Uma lista por papel (complexo, mais correto)**
- `structure.ts` cria uma seção "Pessoas" com sub-itens: "Modelos", "Fotógrafos", "Produção", etc.
- Cada sub-item é um `OrderableDocumentListDeskItem` filtrado por `role`.
- `orderRank` é único por documento, mas o editor só arrasta dentro do contexto do papel.
- GROQ mantém o filtro por `role` existente, ordena por `orderRank asc`.
- Mais setup em `structure.ts`; mais correto editorialmente.

**Recomendação**: Opção B. O Studio já tem a noção de "seção por papel" implícita no uso (query separada por role); tornar isso explícito na estrutura melhora a UX sem custo no front.

**Esta fase só deve ser executada após Wesley confirmar qual opção seguir.**

---

## 9. Glossário

- **`orderRank`**: campo `string` gerado pelo plugin que armazena um rank LexoRank. Permite inserções entre items sem renumerar. Opaco — não é exibido ao editor.
- **LexoRank**: algoritmo de rank fracionário onde inserir entre "a" e "b" gera "am" (ex.). Elimina colisões e renumerações.
- **`OrderableDocumentListDeskItem`**: componente do plugin que substitui `S.documentList()` na estrutura do Studio, adicionando handles de drag-and-drop.
- **`initialOrderRankFor(type)`**: helper do plugin que gera o rank inicial para um documento novo de um tipo.
- **`setIfMissing`**: operação de patch do Sanity client que só escreve se o campo ainda não existe — garante idempotência do script de seed.

---

## 10. Apêndice — Configuração

| Variável                | Ambientes    | Valor                                                                 |
| ----------------------- | ------------ | --------------------------------------------------------------------- |
| `SANITY_API_WRITE_TOKEN` | local apenas | Token com permissão de write, usado pelos scripts de seed e cleanup. |

Sem novas envs em runtime. Sem novos webhooks. Sem mudanças de CORS.

---

## 11. Fora de escopo (não agora)

- **`look` / `lookNumber`**: `lookNumber` ("01", "02") é uma chave **semântica** — aparece no UI como "Look 01" e é usada para comunicação editorial ("vou editar o look 03"). Não é apenas um índice de ordenação. Substituir por `orderRank` opaco quebraria essa semântica. O padrão correto para looks é manter `lookNumber` e aceitar que inserir um look "entre o 01 e o 02" exige renomear um dos dois — o que é raro e intencional. Se o volume de looks crescer muito e a renomeação virar problema real, revisitar com uma estratégia específica (ex.: `lookNumber` como label livre + `orderRank` como chave de ordem).
- **Ordenação de `brand` com drag-and-drop**: se a decisão mudar e Wesley quiser ordem manual de marcas no site, a Fase 3 vira uma migração com o plugin em vez de simples remoção de campo.
- **Ordenação dentro de `look.pieces[]`**: o array de peças de um look já é ordenado pela posição no array (drag-and-drop nativo do Sanity para arrays). Não precisa do plugin.

---

## 12. Trade-offs discutidos

**Por que não migrar tudo de uma vez?**
- **Opção A (escolhida)**: tipo por tipo, em fases separadas. Cada fase tem seu script de seed e validação. Rollback é um revert de commit + cleanup script.
- **Opção B**: migração em massa (um script que migra todos os tipos de uma vez). Rejeitada — erro em um tipo contamina todos; dificulta rollback seletivo.

**`orderRank` vs `order: number` para `pieceType`**
- **Opção A (escolhida)**: migrar para `orderRank`. Consistência com os outros tipos; drag-and-drop é melhor UX para o picker.
- **Opção B**: manter `order: number` em `pieceType` (catálogo pequeno, raramente muda). Aceitável, mas cria inconsistência com `creditGroup` após a Fase 1. Custo de migração é baixo — vale a consistência.

**`brand.order`: remover vs migrar para plugin**
- **Opção A (escolhida)**: remover sem plugin, já que a query já usa ordem alfabética.
- **Opção B**: migrar para plugin (futura possibilidade). Não agora — adiciona complexidade sem benefício imediato.

**`person`: lista global vs lista por papel**
- **Opção A**: lista única global. Simples de implementar, mas editorialmente confuso.
- **Opção B (recomendada)**: lista por papel. Mais complexa no `structure.ts`, mas reflete o uso real. Decisão final fica com Wesley antes da Fase 4.
