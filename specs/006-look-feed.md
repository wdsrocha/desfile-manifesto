# PRD 006 — Feed de looks estilo Instagram

> Status: Draft
> Autor: Wesley Rocha
> Data: 2026-05-03
> Audiência: Wesley (decisor) e agentes de codificação executando fases isoladas

---

## 1. Sumário executivo

Hoje a seção de looks abre cada look em um modal único acionado por estado React (`LookViewer`). Esta PRD substitui essa experiência por um **feed vertical estilo Instagram**: clicar em um look navega para uma URL própria, rolar para o lado avança entre imagens do look atual, rolar para baixo avança para o próximo look. Voltar para a home funciona via botão nativo do navegador / swipe-back do iOS, sem perder a posição da grid.

A migração é **incremental e sem big-bang**: cada fase é shippável e mantém a experiência atual funcionando até a fase seguinte. A sequência prioriza primeiro a rota canônica `/looks/[slug]` (deep-link + SEO), depois interceptação para overlay-sobre-home (preservando scroll), depois o feed vertical, e por fim polimento e performance.

**Estado final**: cada look tem uma rota própria `/looks/[slug]` que renderiza um feed vertical (snap-scroll) começando no look acessado. Cliques na grid da home usam Next.js intercepting routes para abrir o feed como overlay sobre a home, sem reload e com scroll preservado. URL atualiza conforme o usuário rola (sem nova navegação). Botão voltar e swipe-back retornam à home na posição original. O `LookViewer`/modal state-driven atual deixa de existir.

---

## 2. Decisões já tomadas (não revisitar sem justificativa)

| Decisão                       | Valor                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| URL canônica                  | `/looks/[slug]` — slug gerado a partir de `model.name + sequencial`, único, persistido no schema                            |
| Identificador no schema       | Novo campo `slug: slug` no `look`, validation required, auto-gerado no Studio com botão "Gerar"                            |
| Roteamento                    | App Router. `app/looks/[slug]/page.tsx` (canônica) + `app/@modal/(.)looks/[slug]/page.tsx` (intercepting + parallel route) |
| Layout do feed                | Vertical CSS scroll-snap (`scroll-snap-type: y mandatory`), cada look ocupa `100dvh` com `scroll-snap-align: start`        |
| Layout dentro do look         | Carrossel horizontal embla (reusa `LookCarousel` atual)                                                                    |
| Renderização de looks         | Render de todos os looks no DOM (dataset pequeno, < 50). Windowing fica como Fase 5 opcional                                |
| Sync de URL ao rolar          | `IntersectionObserver` detecta look ativo → `window.history.replaceState` (sem reload, sem novo entry no stack)            |
| Voltar para a home            | Comportamento nativo do navegador/iOS. Sem listener manual de `popstate`. Scroll restoration default do Next.js            |
| Fechar overlay (modal)        | Botão X visível no topo + clique no backdrop (apenas em desktop). No mobile, deslizar para baixo NÃO fecha (Fase 4 P2)     |
| Metadata / OG por look        | `generateMetadata` na rota canônica. Title = "Look — {Modelo}", OG image = `images[0]`                                     |
| `LookViewer` atual            | Removido na Fase 2. Sem co-existência com a nova navegação                                                                 |
| Pré-carregamento entre looks  | Ao montar feed, prefetch da `images[0]` dos N=2 looks vizinhos. Imagens internas seguem on-open atual                      |
| Áreas de scroll               | O feed scrolla a janela inteira. Não criar container scrollável próprio — quebra swipe-back do iOS                         |
| Comportamento desktop         | Mouse wheel pula para o próximo look (snap nativo). Sem JS para virar slide manualmente                                    |

---

## 3. Arquitetura / modelo mental

**Rotas:**
```
app/
  layout.tsx
  page.tsx                              ← home (grid permanece)
  @modal/
    default.tsx                         ← retorna null
    (.)looks/[slug]/page.tsx            ← INTERCEPTADA: overlay sobre home
  looks/
    [slug]/
      page.tsx                          ← CANÔNICA: feed standalone (deep-link/refresh)
      not-found.tsx
```

**Fluxo: clique na home → modal-feed:**
```
HomePage grid (LooksSection)
  └─ <Link href={`/looks/${look.slug}`} scroll={false}>
       └─ Next intercepta → renderiza @modal/(.)looks/[slug]/page.tsx
            └─ <LookFeedOverlay startSlug={slug} looks={allLooks} />
                 └─ vertical snap container, looks.length children
                 └─ IntersectionObserver atualiza URL via replaceState
       └─ home permanece montada por trás (scroll preservado)
```

**Fluxo: deep-link / refresh / share:**
```
GET /looks/abc-modelo
  └─ app/looks/[slug]/page.tsx (RSC)
       └─ fetch allLooks (mesma query da home)
       └─ <LookFeedStandalone startSlug={slug} looks={allLooks} />
            └─ mesma UI do overlay, sem backdrop, sem botão fechar
            └─ botão "voltar" no header → router.push("/")
```

**Fluxo: rolar dentro do feed:**
```
user scrolla
  └─ snap-y prende cada look em 100dvh
  └─ IntersectionObserver (rootMargin "-50% 0px") detecta novo look ativo
  └─ window.history.replaceState(null, "", `/looks/${activeSlug}`)
  └─ URL muda sem nova entrada no stack → back button volta à home
```

**Componente unificado:**
```
LookFeed (Client Component)
  props: looks: AllLooksQueryResult, startSlug: string, mode: "overlay" | "standalone"
  - efeito on-mount: scroll para o slug inicial (scrollIntoView "instant")
  - render: <article> por look com <LookCarousel images={...}>
  - render: metadata abaixo do carrossel (modelo, peças, fotógrafo) — layout mobile-first
  - mode "overlay": wrap com backdrop + botão X
  - mode "standalone": header fino com link "Voltar"
```

---

## 4. Convenções

- Slug: `kebab-case do model.name`. Gerado no Studio, persistido no documento. Nunca derivar em runtime. `model.name` é único por design — dataset pequeno, fora do escopo esperado de crescimento.
- Não criar `LookFeedOverlay` e `LookFeedStandalone` como dois componentes separados. Um único `LookFeed` com prop `mode`. A diferença visual é ~30 linhas de wrapper.
- A página intercepted (`@modal/(.)looks/[slug]/page.tsx`) e a canônica (`app/looks/[slug]/page.tsx`) compartilham a mesma data fetch e o mesmo `<LookFeed>`. Se divergir, é bug.
- Não usar `<dialog>` HTML nativo para o overlay — conflita com scroll-snap em iOS Safari. Usar `<div role="dialog">` (igual ao `LookViewer` atual).
- O `<LookCarousel>` atual permanece intacto. Ele já encapsula embla com loop, dots, setas em desktop.
- Não criar uma "página de feed" `/looks` (sem slug) nesta PRD. Feed sempre tem look-âncora.
- Metadata por look usa `generateMetadata` na canônica. Não duplicar na intercepted (intercepted herda da canônica em refreshes? Não — intercepted nunca renderiza standalone, então não há dupla; suficiente declarar na canônica).

---

## 5. Estratégia de ambientes

Sem mudanças. Mesma rota em local/preview/prod. O slug é estável por documento; mudanças manuais via Studio precisam atenção (ver Riscos).

Webhook de revalidação (PRD 001) já cobre: ao publicar look com novo slug, `/api/revalidate` invalida a home E a rota `/looks/[slug]` nova. Adicionar `slug` ao payload tratado em `route.ts` se aplicável.

---

## 6. Restrições técnicas / limites externos

- **iOS Safari + scroll-snap**: snap em containers internos quebra swipe-back. Solução: scroll é da janela (`html, body` rolam). Cada look é child direto do `<main>` com `min-h-[100dvh]` e `scroll-snap-align: start` no `<main>`.
- **`100dvh`**: usar `dvh` (não `vh`) para acomodar barras dinâmicas de mobile. Fallback `vh` via `min-height: 100vh; min-height: 100dvh` no Tailwind 3+.
- **Next.js intercepting routes**: requerem parallel route slot `@modal` no layout pai. Esquecer o `default.tsx` causa render vazio do slot em rotas não interceptadas.
- **`router.push` vs `<Link>`**: usar `<Link href scroll={false}>` na grid para evitar scroll-to-top ao interceptar. Teste manual obrigatório.
- **`history.replaceState` em RSC**: client-only. Disparar dentro de `useEffect` no `LookFeed`.
- **SEO**: a canônica `/looks/[slug]` deve ter `generateStaticParams` para SSG das rotas. Sitemap (PRD futura) precisa incluir cada slug.
- **Bundle**: `LookFeed` e `LookCarousel` são client components. O peso já existe pelo embla; o feed adiciona ~2kB de lógica de IntersectionObserver. Aceitável.
- **Sanity slug field**: requer `source` callback para auto-gerar. Validation custom para garantir único no dataset (`isUniqueAcrossDocuments`).

---

## 7. Riscos e mitigações

| Risco                                                              | Probabilidade | Mitigação                                                                                                          |
| ------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| Intercepting route não renderiza overlay (slot mal configurado)    | Médio         | Phase 2 com smoke test: clicar na grid abre overlay; F5 vai para canônica; voltar restaura home                    |
| iOS swipe-back conflita com scroll-snap horizontal do carrossel    | Médio         | Carrossel embla já trata gestos. Validar manualmente em iOS real na Fase 3                                         |
| `replaceState` causa loop de re-render                             | Baixo         | Atualizar URL fora do React (não em state). IntersectionObserver com debounce de 80ms                             |
| Slug colide ou é alterado após indexação                           | Médio         | Validation `isUniqueAcrossDocuments`. Documentar no Studio: "não alterar após publicar"                            |
| Render de N looks pesa em mobile antigo                            | Baixo         | Dataset atual < 50 looks. Carrossel embla já é lazy-render por slide. Se virar problema, Fase 5 windowing          |
| LCP da home regride por prefetch agressivo                         | Baixo         | Prefetch de vizinhos só dispara dentro do feed (não na home)                                                       |
| Botão voltar do navegador comportamento inesperado em deep-link    | Médio         | Deep-link → voltar fora do site. Testar e documentar. Adicionar header "Voltar" explícito na canônica (Fase 1)     |
| Removal do `LookViewer` quebra alguma referência                   | Baixo         | Grep `LookViewer` antes de deletar. Build CI pega                                                                  |
| Slug `kebab(model.name)` vazio (look sem modelo)                   | Médio         | Fallback `look-{shortid}`; validation rejeita vazio                                                                |
| Restoração de scroll da home falha em alguns navegadores            | Médio         | Next.js `experimental.scrollRestoration` ou manual via `sessionStorage`. Testar antes de remover modal             |

---

## 8. Roteiro de fases

> Como ler: cada fase é auto-contida e shippável. Um agente executa uma fase lendo apenas:
> este PRD, AGENTS.md, a fase corrente e os arquivos listados em "Arquivos tocados".
> Fases respeitam o estilo do PRD 002 (incremental, sem big-bang).

### Status das fases

| Fase | Título                                                       | Prioridade | Status |
| ---- | ------------------------------------------------------------ | ---------- | ------ |
| 0    | Schema: campo `slug` em `look` + backfill                    | P0         | ⬜      |
| 1    | Rota canônica `/looks/[slug]` renderizando 1 look            | P0         | ⬜      |
| 2    | Intercepting route + remoção do `LookViewer` state-driven    | P0         | ⬜      |
| 3    | Feed vertical: snap-scroll de todos os looks                 | P0         | ⬜      |
| 4    | Polimento desktop e mobile (a11y, atalhos, dicas visuais)    | P1         | ⬜      |
| 5    | Windowing / virtualização do feed                            | P2         | ⬜      |

---

### Fase 0 — Schema: campo `slug` em `look` + backfill [P0]

**Objetivo**: cada `look` possui um `slug` único, persistido, gerado no Studio.

**Pré-requisitos**: nenhum.

**Arquivos a criar:**
- `scripts/backfill-look-slugs.ts` — varre todos os looks; se sem slug, gera `kebab(model.name)`; patch via `client.patch().setIfMissing({ slug })`. Looks sem `model.name` são listados como aviso e ignorados (editor deve preencher no Studio antes de rodar novamente). Idempotente. Suporta `--dry-run`.

**Arquivos a modificar:**
- `src/sanity/schemas/look.ts` — adicionar `defineField({ name: 'slug', type: 'slug', validation: Rule => Rule.required(), options: { source: doc => doc.model?.name ?? 'look', maxLength: 60, isUnique: isUniqueSlug } })`. Implementar `isUniqueSlug` usando `client.fetch` (ver docs Sanity).
- `src/sanity/queries/looks.ts` — adicionar `slug` à projeção (`'slug': slug.current`).

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. Backup do dataset: `npx sanity dataset export production backup-pre-pr-006.tar.gz` (Node 24).
2. Dry-run: `tsx scripts/backfill-look-slugs.ts --dry-run`.
3. Run real: `tsx scripts/backfill-look-slugs.ts` (com `SANITY_API_WRITE_TOKEN`).
4. `nvm use 24 && npm run typegen` para regenerar `src/sanity/types.ts`.
5. Conferir no Studio: cada look tem slug visível e editável; tentar duplicar slug → erro de validação.

**Migração de conteúdo:**
- N looks existentes ganham `slug` derivado do nome do modelo. Ex.: `lucas-monteiro-a3f2x9`.

**Critérios de aceitação:**
- [ ] Todos os looks têm `slug` populado e único.
- [ ] `npm run typegen` gera `slug: string` em `AllLooksQueryResult`.
- [ ] `tsc --noEmit` passa.
- [ ] Studio rejeita slug duplicado.

**Commits sugeridos:**
1. `feat(look): add slug field with uniqueness validation`
2. `chore(content): backfill slugs for existing looks`
3. `feat(looks): project slug in groq query`

**Notas para o agente:**
- `isUniqueAcrossDocuments` é o helper canônico do Sanity para slugs únicos. Importar de `sanity` se disponível, ou implementar via `client.fetch('count(*[_type=="look" && slug.current==$slug && _id != $id])')`.
- O script de backfill deve ler tanto `*[_type=="look"]` quanto `drafts.*` se houver — manter slugs consistentes.
- Não tornar slug `readOnly` no Studio. Editores podem precisar ajustar (com risco assumido).

---

### Fase 1 — Rota canônica `/looks/[slug]` renderizando 1 look [P0]

**Objetivo**: existe uma URL navegável que mostra um único look (carrossel + metadata) em página própria. Funciona via deep-link, refresh, share. Home permanece state-driven (modal antigo intacto).

**Pré-requisitos**: Fase 0.

**Arquivos a criar:**
- `src/app/looks/[slug]/page.tsx` — Server Component. `generateStaticParams` retorna todos os slugs. `generateMetadata` cria title/description/OG por look. Renderiza `<LookPage look={look} />`.
- `src/app/looks/[slug]/not-found.tsx` — fallback 404.
- `src/components/LookPage.tsx` — Client Component (consome `LookCarousel`). Layout: header fino com link "← Voltar para a home" (`<Link href="/" />`), carrossel ocupando viewport, painel de metadata abaixo (modelo + peças). Mobile: carrossel + metadata empilhados; desktop: lado a lado (igual ao modal atual).
- `src/sanity/queries/look-by-slug.ts` — query `*[_type=="look" && slug.current==$slug][0]{ ...mesma projeção da allLooks }`.

**Arquivos a modificar:**
- `src/app/api/revalidate/route.ts` — incluir `revalidatePath('/looks/' + slug)` quando o webhook for de `look`.
- `src/sanity/queries/looks.ts` — exportar tipo derivado se necessário para reuso em `look-by-slug.ts`.

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. `npm run typegen` após criar a query nova.
2. Smoke test: `npm run dev`, abrir `/looks/<slug-existente>`, conferir render. Tentar slug inexistente → 404.

**Migração de conteúdo:** nenhuma.

**Critérios de aceitação:**
- [ ] `/looks/[slug]` renderiza o look com carrossel funcional (swipe, dots, setas em desktop).
- [ ] Metadata correta: title contém nome do modelo, OG image é `images[0]`.
- [ ] `/looks/slug-inexistente` retorna 404.
- [ ] Build SSG: `npm run build` gera uma rota estática por slug.
- [ ] Home continua funcionando exatamente como hoje (modal state-driven não foi tocado).

**Commits sugeridos:**
1. `feat(looks): add by-slug query`
2. `feat(looks): add /looks/[slug] canonical route`
3. `feat(revalidate): invalidate look pages on publish`

**Notas para o agente:**
- Reusar `LookCarousel` e `LookPieces` existentes. Não duplicar layout.
- Para `generateStaticParams`, usar a `allLooksQuery` para obter slugs.
- Não usar `next/dynamic` aqui — a página inteira é client-side mesmo.
- Se a query `look-by-slug` retornar `null`, chamar `notFound()` do `next/navigation`.

---

### Fase 2 — Intercepting route + remoção do `LookViewer` state-driven [P0]

**Objetivo**: clicar em um look na home empurra a URL `/looks/[slug]` mas renderiza como overlay sobre a home (intercepting route). F5 ou compartilhar a URL leva à canônica da Fase 1. Voltar (browser/iOS) fecha o overlay e volta para a home com scroll preservado. O modal state-driven antigo é removido.

**Pré-requisitos**: Fase 1.

**Arquivos a criar:**
- `src/app/@modal/default.tsx` — `export default function Default() { return null }`.
- `src/app/@modal/(.)looks/[slug]/page.tsx` — Server Component. Mesma data fetch que a canônica. Renderiza `<LookOverlay look={look} />`.
- `src/components/LookOverlay.tsx` — Client Component. Wrapper com backdrop (`bg-ink/70 backdrop-blur-sm`) + botão X (chama `router.back()`). Renderiza `<LookPage look={look} mode="overlay" />` por dentro.

**Arquivos a modificar:**
- `src/app/layout.tsx` — adicionar prop `modal` no layout: `export default function RootLayout({ children, modal }: { children, modal: ReactNode }) { return <html><body>{children}{modal}</body></html> }`.
- `src/app/page.tsx` — sem mudanças se `LooksSection` for ajustada via componente.
- `src/components/LooksSection.tsx` — substituir `<button onClick={() => setActive(look)}>` por `<Link href={`/looks/${look.slug}`} scroll={false} prefetch>`. Remover state `active`, `setActive`, `<LookViewer>` e o efeito de prefetch de capa (Next.js cuida).
- `src/components/LookPage.tsx` — adicionar prop opcional `mode?: "page" | "overlay"`. No modo overlay, esconder o link "Voltar" do header (botão X já cobre).

**Arquivos a deletar:**
- `src/components/LookViewer.tsx` — substituído pela combinação `LookOverlay` + `LookPage`.

**Tarefas externas:**
1. Smoke test exaustivo:
   - Clicar em look na home → overlay abre, URL muda para `/looks/[slug]`.
   - Fechar (X ou backdrop) → URL volta para `/`, scroll da home preservado.
   - Botão voltar do navegador → mesma coisa.
   - Swipe-back iOS → mesma coisa.
   - F5 com overlay aberto → cai na canônica, sem overlay.
   - Compartilhar URL → abre canônica direto.
2. Testar em iOS Safari real (não só simulador).

**Migração de conteúdo:** nenhuma.

**Critérios de aceitação:**
- [ ] Cliques na grid abrem overlay sem reload.
- [ ] URL reflete o look aberto.
- [ ] Voltar (qualquer modo) fecha overlay sem perder scroll da home.
- [ ] F5 com overlay aberto → renderiza a página canônica.
- [ ] `LookViewer.tsx` removido; `grep -r "LookViewer" src` retorna vazio.
- [ ] `tsc --noEmit` e `npm run build` limpos.

**Commits sugeridos:**
1. `feat(layout): add @modal parallel route slot`
2. `feat(looks): intercept /looks/[slug] as overlay over home`
3. `refactor(looks): replace state-driven viewer with link navigation`
4. `chore(looks): remove obsolete LookViewer component`

**Notas para o agente:**
- ANTES de codar: ler `node_modules/next/dist/docs/01-app/01-getting-started/13-parallel-and-intercepting-routes.mdx` (ou path equivalente) para a API atual. Não confiar em memória.
- Esquecer `@modal/default.tsx` causa erro 404 ao navegar para rotas não interceptadas. É a pegadinha clássica.
- `<Link scroll={false}>` é crítico: sem ele, Next.js scrolla a home para o topo ao "navegar".
- Escutar `Escape` no `LookOverlay` (tecla = `router.back()`). Replicar lógica do `LookViewer` antigo (body overflow hidden enquanto aberto).
- Se Next.js `experimental.scrollRestoration` não estiver ativo no `next.config.mjs`, ativar. Necessário para scroll preservado no voltar.

---

### Fase 3 — Feed vertical: snap-scroll de todos os looks [P0]

**Objetivo**: ao abrir um look (overlay ou canônica), o usuário vê um feed vertical onde cada look ocupa 100dvh com snap. Rolar para baixo avança para o próximo look. Carrossel horizontal por look continua funcionando. URL atualiza conforme o look ativo muda.

**Pré-requisitos**: Fase 2.

**Arquivos a criar:**
- `src/components/LookFeed.tsx` — Client Component. Props: `looks: AllLooksQueryResult`, `startSlug: string`, `mode: "overlay" | "page"`.
  - On-mount: encontrar `<article>` do `startSlug`, `scrollIntoView({ behavior: "instant" })`.
  - `IntersectionObserver` com `rootMargin: "-50% 0px"` em cada `<article>`. Quando intersecta, set `activeSlug` (ref, não state) e `window.history.replaceState(null, "", \`/looks/\${slug}\`)`.
  - Render: `<article data-slug={slug}>` por look. Cada um: `min-h-[100dvh] snap-start flex flex-col`. Carrossel ocupa região superior; metadata abaixo.
  - O container raiz: `snap-y snap-mandatory` (ou no `<main>` ancestral; ver convenções).
- `src/components/LookFeedItem.tsx` — Client Component. Renderiza um look (carrossel + metadata). Recebe `look` e `priority` (boolean — primeira imagem do look-âncora marca priority).

**Arquivos a modificar:**
- `src/app/looks/[slug]/page.tsx` — buscar `allLooks` em vez de `lookBySlug`. Renderizar `<LookFeed looks={allLooks} startSlug={params.slug} mode="page" />`.
- `src/app/@modal/(.)looks/[slug]/page.tsx` — mesma mudança, com `mode="overlay"`.
- `src/components/LookOverlay.tsx` — wrap em `<LookFeed mode="overlay">`. Backdrop e X permanecem; X chama `router.push("/")` (não `back()` — usuário pode ter rolado vários looks; voltar para home é o esperado).
- `src/components/LookPage.tsx` — descontinuar uso direto. Pode ser deletado se a Fase 1 não tiver outros consumidores; senão, manter como helper interno do `LookFeedItem`.

**Arquivos a deletar:**
- `src/components/LookPage.tsx` — se não tiver outro uso após esta fase.

**Tarefas externas:**
1. Smoke test:
   - Abrir um look pelo meio da grid → feed inicia naquele look.
   - Rolar para baixo → próximo look entra; URL muda sem reload.
   - Voltar → fecha overlay e cai na home na posição original.
   - Carrossel horizontal continua funcionando dentro de cada look.
   - F5 no meio do feed → recarrega no slug atual (canônica).
2. Testar iOS real: scroll vertical não conflita com swipe horizontal do carrossel.
3. Lighthouse mobile: home continua sem regressão de LCP.

**Migração de conteúdo:** nenhuma.

**Critérios de aceitação:**
- [ ] Snap vertical funcional em mobile e desktop.
- [ ] URL sincroniza com o look ativo via `replaceState` (sem novas entradas no histórico).
- [ ] Voltar do navegador retorna à home, não ao look anterior do feed.
- [ ] Carrossel horizontal segue funcional dentro de cada look.
- [ ] iOS swipe-back funciona normalmente.
- [ ] Sem regressão de LCP na home.

**Commits sugeridos:**
1. `feat(looks): add LookFeed component with vertical snap scroll`
2. `feat(looks): sync URL to active look via replaceState`
3. `refactor(looks): switch routes to render full feed`

**Notas para o agente:**
- ANTES de codar: ler `node_modules/next/dist/docs/.../scroll-restoration.mdx` ou similar. Validar interação com intercepting route.
- `replaceState` deve ser **debounced** (~80ms) e idempotente (não chamar se URL já bate).
- `IntersectionObserver` thresholds: usar `[0.5]` ou `rootMargin: "-50% 0px -50% 0px"` para detectar o look "central". Documentar a escolha em comentário curto se a heurística não for óbvia.
- Carrossel embla precisa de `dragFree: false` e `axis: "x"` (default). Snap vertical é CSS puro; embla cuida do horizontal.
- Não usar `position: sticky` para o painel de metadata — quebra snap em iOS.
- O painel de metadata pode ficar abaixo do carrossel (mobile-style). Em desktop, considerar split (carrossel à esquerda, meta à direita) DENTRO do mesmo `100dvh`. Decisão visual fica para a fase 4 se for divergência.

---

### Fase 4 — Polimento desktop e mobile [P1]

**Objetivo**: experiência polida — atalhos de teclado, dicas visuais para descobrir o gesture, melhor a11y, prefetch de vizinhos.

**Pré-requisitos**: Fase 3.

**Arquivos a criar:**
- `src/components/LookFeedHints.tsx` — overlay sutil que aparece nos primeiros 2 segundos do primeiro acesso (sessão), com setas indicando "↕ próximo look" e "↔ próxima foto". `localStorage` flag para não repetir.

**Arquivos a modificar:**
- `src/components/LookFeed.tsx`:
  - Keyboard: `↓`/`PageDown` rola para próximo look; `↑`/`PageUp` para anterior; `←`/`→` delega para o carrossel ativo (via ref).
  - Prefetch: ao entrar em um look, `new Image().src` para `images[0]` dos N=2 vizinhos (anterior e próximo).
  - A11y: cada `<article>` com `aria-labelledby` apontando para o nome do modelo; `aria-current` no ativo.
- `src/components/LookOverlay.tsx`:
  - Botão X com `aria-label="Voltar para a home"`.
  - `inert` no `main` da home enquanto overlay está aberto (acessibilidade de foco).

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. Teste de a11y manual com leitor de tela (VoiceOver no macOS/iOS).
2. Verificar `tab` navigation: focus não escapa do overlay.

**Migração de conteúdo:** nenhuma.

**Critérios de aceitação:**
- [ ] Setas do teclado navegam entre looks (vertical) e fotos (horizontal).
- [ ] Hints aparecem na primeira visita e somem; não voltam na sessão.
- [ ] Foco não escapa do overlay quando aberto.
- [ ] Prefetch dos 2 vizinhos visível em DevTools.

**Commits sugeridos:**
1. `feat(looks): keyboard navigation in feed`
2. `feat(looks): hint overlay on first feed view`
3. `a11y(looks): focus trap and aria for overlay`
4. `perf(looks): prefetch neighbor cover images`

**Notas para o agente:**
- Não usar libs de focus trap (peso desnecessário). `inert` resolve em browsers modernos.
- Hints devem ser dispensáveis com qualquer interação (scroll, click).

---

### Fase 5 — Windowing / virtualização [P2]

**Objetivo**: opcional. Render apenas N=3 looks (anterior, ativo, próximo) no DOM. Disparar mount/unmount via IntersectionObserver. Reduz uso de memória em galerias grandes.

**Pré-requisitos**: Fase 4. Disparar SOMENTE se medições mostrarem problema (memória > 200MB em mobile, ou jank visível ao rolar).

**Arquivos a criar:** nenhum.

**Arquivos a modificar:**
- `src/components/LookFeed.tsx` — manter o `<article>` placeholder (com `min-h-[100dvh]`) sempre; renderizar `<LookFeedItem>` por dentro só se `index ∈ [active-1, active+1]`. Placeholder mantém posições corretas no scroll.

**Arquivos a deletar:** nenhum.

**Tarefas externas:**
1. Medir antes (Chrome DevTools Performance + Memory).
2. Medir depois para confirmar ganho.

**Migração de conteúdo:** nenhuma.

**Critérios de aceitação:**
- [ ] Memory footprint medido como X% menor.
- [ ] Sem regressão visual ao rolar rápido.
- [ ] Snap continua preciso (placeholder com altura correta).

**Commits sugeridos:**
1. `perf(looks): window feed to ±1 look around active`

**Notas para o agente:**
- Pular esta fase se o feed estiver fluido com todos os looks renderizados. É overengineering preventivo.
- Cuidado com `<img>` em placeholder — não montar nenhuma para não disparar fetch.

---

## 9. Glossário

- **Slug**: string única, kebab-case, persistida em `look.slug.current`. Compõe a URL canônica.
- **Rota canônica**: `/looks/[slug]` em `app/looks/[slug]/page.tsx`. Renderiza standalone.
- **Rota interceptada**: `app/@modal/(.)looks/[slug]/page.tsx`. Renderiza overlay sobre a home. Só dispara quando navegação parte da home.
- **Parallel route slot**: `@modal` no layout raiz. Permite renderizar conteúdo paralelo ao `children`.
- **Snap feed**: container com `scroll-snap-type: y mandatory`, cada filho `100dvh` + `snap-start`.
- **`replaceState`**: API do navegador para mudar a URL sem nova entrada no histórico.
- **Look ativo**: o look cujo `<article>` ocupa o centro do viewport, detectado via IntersectionObserver.
- **Modo overlay vs page**: prop do `LookFeed` que muda apenas o wrapper externo (com/sem backdrop, com/sem botão X).

---

## 10. Apêndice — Configuração

| Variável                 | Ambientes    | Valor                                                                         |
| ------------------------ | ------------ | ----------------------------------------------------------------------------- |
| `SANITY_API_WRITE_TOKEN` | local apenas | Token write para o backfill de slugs da Fase 0. Não exportar para Vercel      |

`next.config.mjs` ganha `experimental: { scrollRestoration: true }` na Fase 2 (se ainda não estiver ativo).

Sem novos webhooks. CORS sem mudanças.

---

## 11. Fora de escopo (não agora)

- Página `/looks` (índice de feed sem âncora).
- Comentários, likes, "salvos".
- Lazy-load progressivo de imagens dentro do carrossel (já tratado no PRD 002).
- Compartilhamento de slide específico (`/looks/[slug]?image=2`).
- Animação de transição entre looks (parallax, etc.).
- Vídeos.
- Deep-link para uma marca/modelo dentro do feed.
- Analytics de tempo gasto por look.
- Suporte a "swipe down to close" no overlay mobile (conflita com snap vertical; reavaliar se houver feedback).

---

## 12. Trade-offs discutidos

**Onde mora a "experiência feed"**
- **Opção A (escolhida)**: feed renderiza nas duas rotas (canônica e interceptada), via componente único `<LookFeed mode>`. Escolhida porque: usuário tem mesma UX vindo da home ou de deep-link; sem fork de comportamento.
- **Opção B**: canônica mostra um look standalone; só a interceptada é feed. Rejeitada porque: usuário que abre URL compartilhada não experimenta o produto principal.
- **Opção C**: criar rota separada `/feed/[slug]` para o feed; `/looks/[slug]` continua single-look. Rejeitada porque: duas URLs para o mesmo conteúdo confunde SEO e share.

**Identificador na URL**
- **Opção A (escolhida)**: `slug` persistido no schema, gerado a partir do nome do modelo (`kebab(model.name)`). Escolhida porque: legível, único, estável, indexável. `model.name` é obrigatório e único no Studio — dataset pequeno, fora do escopo esperado de crescimento. Sem sufixo aleatório.
- **Opção B**: `_id` Sanity (UUID). Rejeitada porque: feio, sem valor SEO, e a UUID muda entre dataset draft/publicado em alguns fluxos.
- **Opção C**: `lookNumber` sequencial (`/looks/05`). Rejeitada porque: não existe campo no schema; reordenar via drag-to-reorder mudaria URLs.

**Estratégia de "fechar overlay"**
- **Opção A (escolhida)**: botão X + clique no backdrop chamam `router.push("/")` (não `back()`). Escolhida porque: depois de rolar 5 looks, o usuário espera "voltar para a home", não "voltar para o look anterior".
- **Opção B**: `router.back()`. Rejeitada porque: precisa unwind múltiplas entradas se URL foi atualizada via `replaceState` (mas justamente por usar `replaceState`, o histórico fica limpo — funcionaria; ainda assim a intenção do usuário é "fechar", não "desfazer").

**Sync de URL ao rolar**
- **Opção A (escolhida)**: `window.history.replaceState`. Escolhida porque: muda URL sem novo entry, sem re-render do React, sem reload.
- **Opção B**: `router.replace` do Next.js. Rejeitada porque: dispara nova render do server component, recria o tree.
- **Opção C**: não sincronizar; URL fica fixa no slug-âncora. Rejeitada porque: quebra share ("compartilho o que estou vendo") e refresh ("F5 me leva pro lugar errado").

**Render de todos vs windowing**
- **Opção A (escolhida)**: render todos. Escolhida porque: dataset pequeno (< 50), DOM pesa pouco, snap-CSS funciona perfeito sem JS de mount/unmount.
- **Opção B**: windowing desde o dia 1. Rejeitada porque: complexidade extra (placeholder height, IntersectionObserver para mount, edge cases de scroll), valor incerto. Reservada para Fase 5 condicional.

**Layout do painel de metadata**
- **Opção A (escolhida)**: empilhado abaixo do carrossel dentro do mesmo `100dvh`. Escolhida porque: igual a Instagram, scroll-snap funciona limpo.
- **Opção B**: drawer lateral em desktop (como o modal atual). Não rejeitada definitivamente — pode evoluir na Fase 4 sem afetar a arquitetura.

**Intercepting route vs modal state-driven com `pushState`**
- **Opção A (escolhida)**: intercepting route. Escolhida porque: padrão idiomático do App Router para esse exato caso; deep-link, share, refresh funcionam sem código extra.
- **Opção B**: manter `LookViewer` state-driven, adicionar `pushState`/`popstate` manualmente. Rejeitada porque: reinventa o que o framework já oferece, perde SEO da rota canônica, mais código pra manter.
