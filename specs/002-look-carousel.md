# PRD 002 — Carrossel de imagens por look

> Status: Done
> Autor: Wesley Rocha
> Data: 2026-05-02
> Audiência: Wesley (decisor) e agentes de codificação executando fases isoladas

---

## 1. Sumário executivo

Cada look deixa de ter uma única imagem e passa a ter uma **galeria** de imagens, exibida em um carrossel estilo Instagram quando o modal abre. Cada imagem leva crédito ao fotógrafo (nome + Instagram clicável). A primeira imagem da galeria é a mesma usada na home grid (capa). Migração **incremental** em fases auto-contidas, sem indisponibilidade.

**Estado final**: o schema `look` armazena `images: array<image>` no lugar de `image`. A grid da home renderiza `images[0]` como capa. Ao abrir o modal, um carrossel embla-carousel-react permite swipe/teclado/dots, com loop, e um overlay discreto exibe `Fotógrafo @handle` no rodapé de cada imagem. Todas as imagens da galeria daquele look são pré-carregadas no momento em que o modal abre. Reabrir o mesmo look não dispara fetch — o cache do navegador serve as imagens.

---

## 2. Decisões já tomadas (não revisitar sem justificativa)

| Decisão              | Valor                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------- |
| Schema               | `images: array<image>` substitui `image` (não convive em paralelo)                    |
| Capa                 | `images[0]` é a capa renderizada na grid da home                                      |
| Crédito              | Por imagem, inline no objeto `image`: `photographerName`, `photographerInstagram`     |
| Crédito IG           | Link clicável (target=_blank), igual ao link do Instagram do modelo                   |
| Lib do carrossel     | `embla-carousel-react` (v8+)                                                          |
| Indicador            | Dots no rodapé do carrossel                                                           |
| Setas                | Apenas em desktop (≥ sm), aparecem no hover                                           |
| Loop                 | Sim, do último volta ao primeiro                                                      |
| Overlay              | Sempre visível, bottom-left, gradient scrim escuro nos 15% inferiores                 |
| Cache de re-abertura | `new Image().src = url` por imagem ao abrir o modal; sem state React, sem DOM mantido |
| Escopo de preload    | Per-look, on-open. Nunca pré-carrega galerias inteiras na home                        |
| Deep-link            | Fora de escopo. Modal continua state-driven                                           |
| Vídeo                | Fora de escopo                                                                        |
| Validação cover      | Studio sugere "primeiro item = capa" via description, sem validação rígida            |
| Migração de conteúdo | Script one-shot move `image` → `images[0]` e remove `image`                           |

---

## 3. Arquitetura / modelo mental

**Schema (Sanity Content Lake):**
```
look {
  lookNumber: string
  images: [
    {
      asset: reference,
      alt: string,
      photographerName: string,
      photographerInstagram: string  // com @
    }
  ]  // min 1
  model: { name, instagram }
  styling: string[]
}
```

**Fluxo de leitura na home:**
```
RSC fetch (allLooksQuery) → looks[]
LooksSection grid → renderiza images[0] como capa (LookImage, priority nos 4 primeiros)
```

**Fluxo do modal (carrossel):**
```
clique na capa → setActive(look) → LookViewer monta
  └─ useEffect on-open:
       └─ for each url in look.images: new Image().src = url   ← prefetch via browser cache
  └─ Embla carousel renderiza todos os slides; loop=true
  └─ cada slide: <LookImage> + <PhotographerCredit overlay>
```

**Re-abrir o mesmo look:**
```
2ª abertura → mesmo prefetch dispara, mas o navegador devolve do disk cache (sem rede).
Next/Image gera o mesmo src (URL determinística do CDN do Sanity) → match de cache.
```

**Trade-off chave**: a capa (`images[0]`) usa `priority` na home; as imagens N>0 da galeria **nunca** entram com `priority`. O preload acontece só após o usuário abrir o modal.

---

## 4. Convenções

- Campos novos no schema seguem o padrão existente: nome em inglês camelCase, label/description em PT-BR.
- O array `images` é renderizado no Studio com drag-to-reorder (default do Sanity para `array of image`). A description do campo deixa explícito: "A primeira imagem é a capa exibida na grid".
- Componente novo: `src/components/LookCarousel.tsx` — encapsula embla. `LookViewer` consome `LookCarousel` no slot da imagem.
- Componente novo: `src/components/PhotographerCredit.tsx` — overlay discreto, reutilizável.
- A query GROQ projeta `images[]{ ..., photographerName, photographerInstagram }`. Não criar query separada para "primeira imagem" — fronts pegam `images[0]`.
- Não criar tipo customizado no Sanity (`object` reutilizável) para `image + crédito`. Manter inline no array do `look` — não há outro lugar que use a mesma forma. Se surgir, refatora-se depois.

---

## 5. Estratégia de ambientes

Sem mudanças. Mesmo dataset `production` em local/preview/prod (decisão de PRD 001).

A migração de conteúdo (mover `image` → `images[0]`) roda contra `production` uma vez, executada localmente pelo Wesley com token de write. Ver Phase 0.

---

## 6. Restrições técnicas / limites externos

- **Sanity Asset CDN**: imagens transformadas via querystring (`?w=...&q=75&auto=format`). URLs determinísticas → cache do navegador é confiável entre aberturas.
- **embla-carousel-react v8+**: ~6kB gzip, sem CSS opinativo, suporta touch + keyboard + autoplay (não usado aqui). Loop nativo via `loop: true`.
- **Next.js Image**: usar `priority` apenas em `images[0]` da grid e nos primeiros 4 cards (já hoje). Imagens do carrossel passam com `loading="eager"` apenas após modal aberto, via `<Image>` montado.
- **LCP**: a capa da home continua sendo o LCP candidato. Não regredir — o preload da galeria deve ser disparado **dentro** do useEffect do modal, jamais durante render do servidor da home.
- **Tamanho do bundle**: embla é client-side, importar dinamicamente se viável (`next/dynamic` em `LookCarousel`) para não inflar o bundle inicial.

---

## 7. Riscos e mitigações

| Risco                                                   | Probabilidade | Mitigação                                                                                                            |
| ------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| Migração quebra looks existentes (perde a única imagem) | Médio         | Script roda em dry-run primeiro; backup via export do dataset antes; idempotente (skip se `images` já existe)        |
| Pré-load de galerias inteiras prejudica LCP             | Baixo         | Preload dispara só dentro do useEffect on-open; nunca em RSC nem no mount da `LooksSection`                          |
| Imagens sem crédito quebram o overlay                   | Alto          | Campos opcionais; overlay esconde quando ambos vazios                                                                |
| Lib embla traz CSS inesperado                           | Baixo         | Embla é headless; estilos são nossos. Smoke test visual no preview antes de produção                                 |
| Drag-to-reorder no Studio não preserva a "capa"         | Médio         | Description explícita; capa é `images[0]` por convenção. Se virar problema recorrente, adicionar custom input depois |
| Re-fetch ao reabrir (cache miss)                        | Baixo         | URLs do CDN do Sanity são determinísticas; `new Image().src` aquece o cache do navegador na 1ª abertura              |

---

## 8. Roteiro de fases

> Como ler: cada fase é auto-contida. Um agente executa uma fase lendo apenas:
> este PRD, AGENTS.md, a fase corrente e os arquivos listados em "Arquivos tocados".

### Status das fases

| Fase | Título                          | Prioridade | Status |
| ---- | ------------------------------- | ---------- | ------ |
| 0    | Schema + migração de conteúdo   | P0         | ⬜      |
| 1    | Query, tipos e capa na grid     | P0         | ⬜      |
| 2    | Carrossel no modal              | P0         | ⬜      |
| 3    | Overlay de crédito ao fotógrafo | P0         | ⬜      |
| 4    | Preload on-open per-look        | P1         | ⬜      |

---

### Fase 0 — Schema + migração de conteúdo [P0]

**Objetivo**: substituir `image` por `images: array<image>` no schema `look` e migrar o conteúdo existente sem perda.

**Pré-requisitos**: nenhum.

**Arquivos a criar:**
- `scripts/migrate-look-images.ts` — script one-shot. Lê todos os looks; para cada um, se `images` não existe, cria `images: [{ ...image }]` e desfaz `image`. Idempotente.

**Arquivos a modificar:**
- `src/sanity/schemas/look.ts` — remover field `image`. Adicionar field `images` (array of image, min 1, validation required). Em cada item do array, adicionar fields: `alt` (string), `photographerName` (string, opcional), `photographerInstagram` (string, opcional, regex `^@?[\w.]+$`). Description do array: "A primeira imagem é a capa exibida na grid de looks".
- `src/sanity/queries/looks.ts` — projetar `images[]{ asset, alt, photographerName, photographerInstagram }` no lugar de `image`.

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. Backup do dataset: `npx sanity dataset export production backup-pre-pr-002.tar.gz` (rodar localmente com Node 24).
2. Dry-run do script de migração: `tsx scripts/migrate-look-images.ts --dry-run` — log do que mudaria.
3. Run real: `tsx scripts/migrate-look-images.ts` (com `SANITY_API_WRITE_TOKEN` no `.env.local`).
4. Confirmar no Studio que cada look tem `images[0]` populado e o campo `image` antigo desapareceu.
5. Rodar `nvm use 24 && npm run typegen` para regenerar `src/sanity/types.ts`.

**Migração de conteúdo:**
- N looks existentes em `production`. Cada um: `image` → `images[0]`. Campos `photographerName`/`photographerInstagram` ficam vazios (Wesley/Glícia preenchem manualmente depois pelo Studio).

**Critérios de aceitação:**
- [ ] `npm run typegen` gera `AllLooksQueryResult` com `images: Array<...>` e sem `image`.
- [ ] `tsc --noEmit` passa.
- [ ] No Studio, todos os looks mostram a galeria com pelo menos 1 imagem (a antiga).
- [ ] Field antigo `image` não aparece mais no formulário.

**Commits sugeridos:**
1. `feat(look): replace image with images array in schema`
2. `chore(content): migrate existing looks to images array`
3. `feat(looks): project images array in groq query`

**Notas para o agente:**
- O regex do Instagram aceita opcional `@` no começo. Não validar como required — fotógrafo pode não ter IG.
- O script de migração precisa ler o documento publicado **e** o draft (`drafts.<id>`) se existir. Use `client.fetch('*[_type == "look"]')` com perspective default e patch via `client.patch(_id).set({ images: [...] }).unset(['image']).commit()`.
- Não tente preservar `image.alt` em um campo separado — copie para `images[0].alt`.

---

### Fase 1 — Query, tipos e capa na grid [P0]

**Objetivo**: a grid da home consome `images[0]` como capa. Nada visualmente muda do ponto de vista do usuário.

**Pré-requisitos**: Fase 0.

**Arquivos a criar:** nenhum.

**Arquivos a modificar:**
- `src/components/LooksSection.tsx` — trocar `look.image` por `look.images?.[0]`. Manter `priority={i < 4}` apenas na capa.
- `src/components/LookViewer.tsx` — temporariamente, renderizar `look.images?.[0]` no mesmo lugar onde renderiza `look.image` hoje. (O carrossel completo entra na Fase 2.)
- `src/components/LookImage.tsx` — sem mudanças funcionais; o tipo de `image` continua aceitando o shape `{ asset, alt }`.

**Arquivos a deletar:** nenhum.

**Tarefas externas:** nenhuma.

**Migração de conteúdo:** nenhuma.

**Critérios de aceitação:**
- [ ] Build passa (`npm run build`).
- [ ] Home renderiza idêntica ao estado anterior.
- [ ] Modal abre e mostra `images[0]` (sem carrossel ainda).
- [ ] `tsc --noEmit` limpo.

**Commits sugeridos:**
1. `refactor(looks): consume images[0] as cover in grid and modal`

**Notas para o agente:**
- Se `images` vier vazio (não deveria após a migração), renderizar nada e logar um warning. Não quebrar a página.

---

### Fase 2 — Carrossel no modal [P0]

**Objetivo**: substituir a imagem única do `LookViewer` por um carrossel embla com swipe, keyboard, dots e setas em desktop. Loop ativo.

**Pré-requisitos**: Fase 1.

**Arquivos a criar:**
- `src/components/LookCarousel.tsx` — Client Component. Props: `images: Array<{ asset, alt }>`, `lookNumber: string`. Usa `useEmblaCarousel({ loop: true })`. Renderiza slides com `<LookImage>`. Dots no rodapé. Setas absolute em `sm:` apenas (`hidden sm:flex`), com hover state.

**Arquivos a modificar:**
- `src/components/LookViewer.tsx` — substituir o `<LookImage>` único pelo `<LookCarousel images={look.images} lookNumber={number} />`. Remover `priority` do carrossel (não vai pra LCP).
- `package.json` — adicionar `embla-carousel-react`.

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. `npm install embla-carousel-react`.

**Migração de conteúdo:** nenhuma.

**Critérios de aceitação:**
- [ ] Modal abre com carrossel funcional: swipe em mobile, setas em desktop, dots clicáveis, teclas `←`/`→` navegam.
- [ ] Loop: do último slide, avançar volta ao primeiro.
- [ ] Aspect ratio do slide igual ao da imagem antiga (`aspect-[9/16]` em mobile, `sm:h-[88vh]` em desktop).
- [ ] Sem regressão de LCP na home (Lighthouse local: capa ainda é o LCP candidato).
- [ ] `tsc --noEmit` limpo.

**Commits sugeridos:**
1. `feat(looks): add embla carousel dependency`
2. `feat(looks): render gallery as carousel in viewer modal`

**Notas para o agente:**
- Antes de codar, leia `node_modules/embla-carousel-react/...` ou os docs oficiais para a API atual (v8+). Não confie em memória.
- Considere `next/dynamic` para `LookCarousel` se o bundle inicial subir mais de ~5kB. Medir antes de decidir.
- Dots: estilo discreto, círculos pequenos, ativo em `bg-cream` ou `bg-white`, inativo em `bg-white/50`. Ficam **acima** do overlay de crédito (Fase 3).
- Setas: `ChevronLeft` / `ChevronRight` da `lucide-react` (já usada). Tamanho similar ao botão de fechar.
- Não implementar autoplay.

---

### Fase 3 — Overlay de crédito ao fotógrafo [P0]

**Objetivo**: cada slide do carrossel exibe, sobreposto na parte inferior, o crédito do fotógrafo de forma discreta. Nome em texto, IG como link.

**Pré-requisitos**: Fase 2.

**Arquivos a criar:**
- `src/components/PhotographerCredit.tsx` — Client Component (precisa ser pelo `<a target=_blank>`). Props: `name?: string`, `instagram?: string`. Retorna `null` se ambos vazios. Posicionado `absolute bottom-0 left-0 right-0`. Gradient scrim: `bg-gradient-to-t from-ink/70 to-transparent` ocupando ~15% da altura. Texto em `text-white`, `text-[12px] sm:text-[13px]`, padding `px-4 pb-3 sm:px-5 sm:pb-4`. Nome em peso normal; IG ao lado em `text-white/75 hover:text-white underline-offset-2 decoration-white/30`.

**Arquivos a modificar:**
- `src/components/LookCarousel.tsx` — em cada slide, montar `<PhotographerCredit name={img.photographerName} instagram={img.photographerInstagram} />` por cima da imagem.

**Arquivos a deletar:** nenhum.

**Tarefas externas:** nenhuma.

**Migração de conteúdo:** nenhuma. Fotógrafos serão preenchidos manualmente no Studio depois desta fase.

**Critérios de aceitação:**
- [ ] Imagem com `photographerName` mostra "Fotógrafo @handle" no rodapé.
- [ ] Sem `photographerName` e sem `photographerInstagram`: nada renderiza.
- [ ] Click no `@handle` abre `https://instagram.com/<handle sem @>` em nova aba (`rel="noreferrer noopener"`).
- [ ] O overlay não interfere nos dots do carrossel (z-index e posicionamento testados em mobile e desktop).
- [ ] Contraste legível em fotos claras e escuras (gradient scrim resolve).

**Commits sugeridos:**
1. `feat(looks): add photographer credit overlay on carousel slides`

**Notas para o agente:**
- Replicar o tratamento do IG do `model` no `LookViewer` atual: `instagram.replace(/^@/, '')` no href, mas exibir o `@` na UI.
- O overlay deve ficar **abaixo** dos dots no eixo Z para que dots fiquem clicáveis. Se conflitar visualmente, mover dots para fora do slide (no container do carrossel).

---

### Fase 4 — Preload on-open per-look [P1]

**Objetivo**: ao abrir o modal de um look, todas as imagens da galeria daquele look são pré-carregadas via `new Image().src`, garantindo navegação instantânea entre slides e ausência de re-fetch ao reabrir.

**Pré-requisitos**: Fase 3.

**Arquivos a criar:** nenhum.

**Arquivos a modificar:**
- `src/components/LookViewer.tsx` — adicionar `useEffect` que dispara quando `look` muda para não-nulo. Para cada `img` em `look.images`, calcular a URL via `urlForImage(img).width(1200).quality(75).url()` e `new Image().src = url`. Sem cleanup necessário (os Image objetos são GC'd; o cache do navegador persiste).

**Arquivos a deletar:** nenhum.

**Tarefas externas:** nenhuma.

**Migração de conteúdo:** nenhuma.

**Critérios de aceitação:**
- [ ] DevTools Network: ao abrir um look com 5 imagens, todas as 5 URLs aparecem como requests.
- [ ] Reabrir o mesmo look não dispara novas requests (status `(disk cache)`).
- [ ] Swipe entre slides é instantâneo após o preload terminar.
- [ ] Abrir um look diferente dispara seu próprio preload, sem afetar o cache do anterior.
- [ ] Não há preload disparado durante o render inicial da home (verificar via Network gravando desde page load: nenhuma URL de imagem além das 4 capas com `priority` deve aparecer antes do clique).

**Commits sugeridos:**
1. `perf(looks): preload gallery images on modal open`

**Notas para o agente:**
- A URL passada ao `new Image().src` deve ser **idêntica** à que o `<Image>` do Next vai requisitar depois — mesma `width` e `quality`. Se divergir, vira cache miss. Manter o `width(1200).quality(75)` igual ao `LookImage.tsx`.
- Não usar `<link rel="preload" as="image">` injetado no `<head>` — preload tags são pra critical-path; aqui queremos hint de cache, não competir com a capa pelo LCP.
- O efeito **não** precisa de cleanup. Cancelar um download em andamento ao trocar de look é overkill — são poucos KB e o navegador prioriza sozinho.

---

## 9. Glossário

- **Capa**: `images[0]`. Renderizada na grid da home com `priority` nos 4 primeiros cards.
- **Galeria**: array `images` completo, exibido no carrossel.
- **Crédito**: par `photographerName` + `photographerInstagram` por imagem.
- **Embla**: lib `embla-carousel-react`, headless, ~6kB gzip.
- **Preload on-open**: `new Image().src = url` disparado dentro do `useEffect` que detecta abertura do modal.

---

## 10. Apêndice — Configuração

| Variável                 | Ambientes    | Valor                                                                                                  |
| ------------------------ | ------------ | ------------------------------------------------------------------------------------------------------ |
| `SANITY_API_WRITE_TOKEN` | local apenas | Token com permissão de write, usado **só** pelo script de migração da Fase 0. Não exportar para Vercel |

Sem novas envs em runtime. Sem novos webhooks. Sem mudanças de CORS.

---

## 11. Fora de escopo (não agora)

- Deep-linking por look (`/looks/05`).
- Suporte a vídeo nos slides.
- Custom input no Studio para "marcar capa" — convenção `images[0]` é suficiente.
- Reordenação programática (drag-to-reorder no Studio é nativo do Sanity).
- Lazy-load progressivo no carrossel (todas as imagens são pré-carregadas no on-open — simples e suficiente para galerias de até ~10 imagens por look).
- Análise: rastreamento de qual slide o usuário visualizou.
- Compartilhamento de slide específico.

---

## 12. Trade-offs discutidos

**Forma do schema**
- **Opção A (escolhida)**: substituir `image` por `images: array<image>`. Escolhida porque: uma única fonte de verdade, sem risco de capa/galeria divergirem, mais simples para o editor.
- **Opção B**: manter `image` (capa) + adicionar `gallery: array<image>` (extras). Rejeitada porque: dois campos editáveis com semântica acoplada convidam erro humano (capa fora da galeria).

**Forma do crédito**
- **Opção A (escolhida)**: por imagem, inline. Escolhida porque: um look pode ter múltiplos fotógrafos e o overlay precisa do dado por slide.
- **Opção B**: por look, único. Rejeitada porque: limita a realidade editorial.
- **Opção C**: referência a um `photographer` document. Rejeitada porque: overhead de criar/manter documentos para um par nome+IG; reuso entre looks é improvável no escopo do desfile.

**Lib do carrossel**
- **Opção A (escolhida)**: `embla-carousel-react`. Escolhida porque: leve, headless, acessível, swipe + keyboard prontos.
- **Opção B**: Swiper. Rejeitada porque: mais pesada e traz features que não usamos (zoom, virtual slides, etc.).
- **Opção C**: scroll-snap puro. Rejeitada porque: implementar dots, loop e teclado do zero é tempo gasto sem ganho.

**Estratégia de cache entre aberturas**
- **Opção A (escolhida)**: `new Image().src` como hint de cache do navegador. Escolhida porque: zero state React, zero DOM persistente, aproveita o cache nativo, URLs determinísticas do CDN do Sanity garantem hit.
- **Opção B**: manter `LookViewer` sempre montado e alternar visibilidade. Rejeitada porque: DOM mais pesado e ganho marginal sobre a Opção A.
- **Opção C**: cache em React state global. Rejeitada porque: duplica o que o navegador já faz.

**Escopo do preload**
- **Opção A (escolhida)**: per-look, on-open. Escolhida porque: galerias inteiras só carregam quando o usuário sinaliza intenção.
- **Opção B**: pré-carregar todas as galerias de todos os looks no mount da home. Rejeitada porque: torpedeia LCP e gasta banda do usuário sem retorno proporcional.
- **Opção C**: pré-carregar a galeria do look adjacente em hover. Rejeitada porque: complexidade extra para um ganho marginal — o on-open já é instantâneo após preload.
