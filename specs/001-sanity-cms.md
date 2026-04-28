# PRD 001 — Sanity CMS

> Status: Proposta
> Autor: Wesley Rocha
> Data: 2026-04-27
> Audiência: Wesley (decisor) e agentes de codificação executando fases isoladas

---

## 1. Sumário executivo

Substituir as fontes de conteúdo hardcoded do site `desfile-manifesto` (`src/lib/data.ts` e `src/data/looks.json`) e o armazenamento de imagens em Vercel Blob por um CMS headless usando **Sanity**. Studio embedado em `/studio` na própria app Next.js. Migração **incremental**, em fases auto-contidas, sem janela de indisponibilidade.

**Estado final**: `data.ts` deixa de existir; `looks.json` deixa de existir; Vercel Blob é descomissionado; Glícia consegue editar os looks pelo Studio; deploys da Vercel (preview e produção) leem do mesmo dataset `production`.

---

## 2. Decisões já tomadas (não revisitar sem justificativa)

| Decisão            | Valor                                                        |
| ------------------ | ------------------------------------------------------------ |
| Migração           | Incremental, fase a fase                                     |
| Studio             | Embedado em `/studio` (mesmo app Next.js)                    |
| Datasets           | Um único dataset: `production`                               |
| Drafts             | Habilitados (rascunho no Studio antes de publicar)           |
| Vercel Blob        | Mantido até a fase 1 concluir; descomissionado na fase 6     |
| Localização        | PT-BR apenas                                                 |
| Naming dos schemas | Inglês (`look`, `brand`, `person`, `event`)                  |
| Editores           | Wesley (admin), Glícia (admin — única role editável no free) |
| Plano              | Free do Sanity (verificar limites na seção 6)                |

---

## 3. Modelo mental — referência rápida pra agentes

Sanity tem três peças:

1. **Content Lake** — store de documentos JSON. Consultas via GROQ.
2. **Studio** — UI de edição (React). Embedada em `/studio`. Definida pelo `sanity.config.ts`.
3. **Asset CDN** — sirva imagens via URL com transformações on-the-fly: `?w=800&auto=format&q=75`.

**Fluxo de leitura na app:**
```
Server Component (RSC) → @sanity/client → GROQ query → Content Lake
                                     ↓
                             tipos via TypeGen
```

**Fluxo de imagem:**
```
<Image src={urlForImage(asset).width(800).auto('format').url()} />
```

**Fluxo editorial:**
```
Glícia/Wesley logam em /studio → editam rascunho → publish → app re-renderiza
```

---

## 4. Convenções de naming

- Schemas: inglês, singular, lowercase camelCase: `look`, `brand`, `person`, `event`, `nextEvent`, `creditGroup`.
- Campos: inglês, camelCase: `lookNumber`, `model`, `styling`, `instagramHandle`.
- IDs de documentos: `look-01`, `brand-melanina-am`, `person-dacota` (legíveis).
- Singleton IDs: hard-coded (`event-current`, `event-next`).
- Arquivos: `src/sanity/schemas/look.ts`, `src/sanity/queries/looks.ts` (por tipo).

> **Importante**: a UI do Studio (labels, descriptions, mensagens) é em **PT-BR**, mas o schema name e fields ficam em inglês. Ex.: `defineField({ name: 'styling', title: 'Styling', description: 'Lista de peças e marcas, uma por linha' })`.

---

## 5. Estratégia de ambientes

**Um dataset `production` para todos os ambientes** (local, preview Vercel, produção Vercel).

- Local lê o mesmo conteúdo da prod via env vars apontando para o dataset `production`.
- Previews da Vercel lêem o mesmo dataset.
- Edições não publicadas ficam como **draft documents** no Sanity (`drafts.<id>`) — não aparecem no site público até o Publish.

**CORS no Sanity** precisa permitir as origens:
- `http://localhost:3000` (dev)
- `https://*.vercel.app` (previews) — adicionar com `allowCredentials: true` se for usar preview mode
- domínio de produção (verificar com `vercel inspect` qual está configurado)

**Variáveis de ambiente** (mesmas em todos os ambientes Vercel):
```
NEXT_PUBLIC_SANITY_PROJECT_ID=<id>
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-04-27
SANITY_API_READ_TOKEN=<token-com-permissão-viewer>   # opcional, usado para draft preview
```

---

## 6. Estratégia de imagens

**Limites do plano free do Sanity (relevantes para este projeto):**
- 100GB de asset storage (uso esperado: ~500MB)
- 100GB de bandwidth/mês
- 1M API CDN requests/mês
- Body máximo de upload: 100MB
- Máximo de 256 megapixels por imagem
- Máximo de 8192px de output em transformações

**Decisões:**
- **Sem pré-compressão para webp.** A CDN do Sanity entrega webp/avif on-the-fly via `?auto=format`.
- **Pré-processamento de dimensão é opcional.** Se as fotos vierem de câmera profissional (>3000px no lado maior), reduzir antes economiza upload time. O `scripts/to-webp.sh` pode ser adaptado para gerar JPEG q90 com `long edge ≤ 3000px` e usado como master de upload.
- **Upload via Studio**: Glícia arrasta os arquivos no campo `image`. Sanity processa, gera variantes sob demanda.
- **Hotspot habilitado** (`options: { hotspot: true }`) — permite editor escolher ponto focal para crops.

**Referência rápida de URL:**
```
urlForImage(asset)
  .width(800)
  .auto('format')   // webp/avif quando suportado
  .quality(75)
  .url()
```

---

## 7. Riscos e mitigações

| Risco                                                                    | Probabilidade | Mitigação                                                                             |
| ------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------- |
| Schema mal modelado, precisa renomear campo depois                       | Média         | Sanity CLI tem `sanity migration run`. Custo baixo com poucos docs.                   |
| Plano free fica insuficiente                                             | Baixa         | 50 imagens × 10MB = 0,5% do storage; bandwidth só vira problema com tráfego massivo.  |
| Studio quebra build do Next                                              | Baixa         | Studio é route-isolated. Bundle do Studio só carrega em `/studio`.                    |
| Glícia precisa de role intermediária                                     | Média         | Free só tem Admin/Viewer. Se virar problema, upgrade para Growth ($15/seat).          |
| Drafts vazarem para produção                                             | Baixa         | Cliente público usa CDN com `useCdn: true` e sem token — só lê published.             |
| Componentes `"use client"` lendo dados estáticos não conseguem fetch RSC | Média         | Refatorar para Server Components ou passar dados via props. Documentado em cada fase. |

---

## 8. Roteiro por fases

> **Como ler:** Cada fase é auto-contida. Um agente com contexto pequeno deve conseguir executar uma fase isolada lendo apenas: este PRD, o `AGENTS.md`, a fase atual, e os arquivos listados em "Arquivos tocados".
>
> **Antes de cada fase**: o agente deve carregar as Sanity rules relevantes via `mcp__Sanity__list_sanity_rules` + `mcp__Sanity__get_sanity_rules`. Mínimo: `nextjs`, `schema`, `groq`, `typegen`. Para fase 1 também: `image`. Para fase 6: `studio-structure`.
>
> **Sanity IDs**: Project ID: gjpl1rmy, Org ID: oiGR9FS6F

---

### Fase 0 — Foundation [P0, bloqueia todas as outras]

**Objetivo**: deixar o projeto preparado para receber schemas. Nada de conteúdo ainda.

**Pré-requisitos**: nenhum.

**Arquivos a criar:**
- `sanity.config.ts` (raiz) — configuração do Studio
- `sanity.cli.ts` (raiz) — configuração do CLI (typegen, migrations)
- `sanity-typegen.json` (raiz) — config do TypeGen
- `src/sanity/env.ts` — leitura tipada das env vars
- `src/sanity/client.ts` — cliente para RSC (público, useCdn=true)
- `src/sanity/image.ts` — helper `urlForImage()`
- `src/sanity/schemas/index.ts` — array vazio `[]` por enquanto
- `src/sanity/types.ts` — placeholder, será gerado por TypeGen
- `src/app/studio/[[...tool]]/page.tsx` — página do Studio
- `src/app/studio/layout.tsx` — layout sem header/footer do site (Studio em tela cheia)

**Arquivos a modificar:**
- `package.json` — adicionar deps e scripts:
  - `sanity`, `next-sanity`, `@sanity/image-url`, `@sanity/vision`, `styled-components`
  - scripts: `"typegen": "sanity typegen generate"`, `"sanity": "sanity"`
- `next.config.mjs` — adicionar `images.remotePatterns` para `cdn.sanity.io`
- `.env.local` (criar se não existir) — variáveis listadas na seção 5
- `.gitignore` — garantir que `.env*.local` está ignorado (provavelmente já está)

**Tarefas no Sanity (via MCP):**
1. `mcp__Sanity__list_organizations` → escolher org
2. `mcp__Sanity__create_project` → criar projeto, dataset `production`
3. `mcp__Sanity__add_cors_origin` → adicionar `http://localhost:3000`
4. Anotar `projectId` e mostrar ao user (vai pra env vars locais e na Vercel)
5. `mcp__Sanity__deploy_schema` será usado nas próximas fases

**Variáveis de ambiente Vercel (preview + production):**
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET=production`
- `NEXT_PUBLIC_SANITY_API_VERSION=2026-04-27`

> Use `vercel env add` para cada uma. Não criar token de read ainda — só na fase 1 se for usar draft mode.

**Critério de aceite:**
- [ ] `npm run dev` funciona sem regressão
- [ ] `localhost:3000/studio` carrega Studio (vazio, sem schemas)
- [ ] `npm run typegen` roda sem erro (tipos vazios são esperados)
- [ ] Deploy preview da Vercel não quebra
- [ ] Vars de env configuradas em local + Vercel (preview + production)

**Commits sugeridos (atomic):**
1. `chore(sanity): install dependencies`
2. `feat(sanity): bootstrap studio config and env`
3. `feat(sanity): mount studio at /studio`
4. `chore(next): allow sanity cdn in image remotePatterns`

---

### Fase 1 — Looks (piloto) [P0]

**Objetivo**: migrar a listagem de looks (incluindo a única imagem de exemplo) para Sanity. Ao final, `looks.json` é deletado e a `LooksSection` lê do Sanity.

**Pré-requisitos**: Fase 0 concluída.

**Schema**: `src/sanity/schemas/look.ts`
```ts
import { defineField, defineType } from 'sanity'

export const look = defineType({
  name: 'look',
  title: 'Look',
  type: 'document',
  fields: [
    defineField({
      name: 'lookNumber',
      title: 'Número do look',
      type: 'string',
      description: 'Ex.: "01", "02". Usado para ordenar e exibir.',
      validation: (Rule) => Rule.required().regex(/^\d{2,}$/),
    }),
    defineField({
      name: 'image',
      title: 'Imagem',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'model',
      title: 'Modelo',
      type: 'object',
      fields: [
        defineField({ name: 'name', title: 'Nome', type: 'string' }),
        defineField({ name: 'instagram', title: 'Instagram (com @)', type: 'string' }),
      ],
    }),
    defineField({
      name: 'styling',
      title: 'Styling',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Uma peça por linha. Ex.: "Camisa: Melanina"',
    }),
  ],
  orderings: [
    {
      title: 'Por número (asc)',
      name: 'lookNumberAsc',
      by: [{ field: 'lookNumber', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'lookNumber', subtitle: 'model.name', media: 'image' },
    prepare: ({ title, subtitle, media }) => ({
      title: `Look ${title}`,
      subtitle,
      media,
    }),
  },
})
```

**Query GROQ**: `src/sanity/queries/looks.ts`
```ts
import { defineQuery } from 'next-sanity'

export const allLooksQuery = defineQuery(`
  *[_type == "look"] | order(lookNumber asc) {
    _id,
    lookNumber,
    "imageUrl": image.asset->url,
    "imageAlt": coalesce(image.alt, "Look " + lookNumber),
    image,
    model { name, instagram },
    styling
  }
`)
```

**Arquivos a criar:**
- `src/sanity/schemas/look.ts` (acima)
- `src/sanity/queries/looks.ts` (acima)

**Arquivos a modificar:**
- `src/sanity/schemas/index.ts` — adicionar `look` ao array
- `src/components/LooksSection.tsx` — passar a receber `looks` por props (ou virar Server Component que busca do Sanity)
- `src/components/LookImage.tsx` — aceitar `image` do Sanity (object) e usar `urlForImage()` + `next/image`
- `src/components/LookViewer.tsx` — mesma adaptação de imagem
- `src/app/page.tsx` — buscar looks no servidor e passar para `LooksSection`
- `src/lib/data.ts` — remover `export const looks: Look[] = []`
- `src/lib/looks.ts` — DELETAR (substituído por `src/sanity/image.ts`)
- `src/data/looks.json` — DELETAR

**Conteúdo a migrar:**
- 1 documento `look-01` (Dacota, @dacotamc, com a imagem do Vercel Blob `look01.webp` baixada e re-uploadada no Sanity).

**Migração — 2 caminhos possíveis:**

**Opção A — Manual via Studio** (recomendado nesta fase):
1. Acessar `/studio`
2. Criar documento "Look" → preencher `lookNumber=01`, model.name=Dacota, model.instagram=@dacotamc, styling (3 itens).
3. Baixar `https://5zj0sqgcbxl9zp09.public.blob.vercel-storage.com/looks/look01.webp` localmente.
4. Drag-and-drop no campo `image`.
5. Publish.

**Opção B — Script via MCP** (deixar pra quando tiver os 50 looks):
- `mcp__Sanity__create_documents_from_json` para criar docs em batch.
- Para imagens, precisa ler bytes e fazer upload via `client.assets.upload()`. **Não é suportado pelo MCP** — exige um script Node ad-hoc em `scripts/migrate-looks.ts`.

**TypeGen:**
1. `npm run typegen` (gera `src/sanity/types.ts` com `Look` e `AllLooksQueryResult`).
2. Importar `AllLooksQueryResult` em `src/app/page.tsx` para tipar o resultado.

**Critério de aceite:**
- [ ] Schema `look` aparece no Studio em `/studio`
- [ ] Look-01 publicado com imagem
- [ ] `LooksSection` renderiza o look-01 buscando do Sanity
- [ ] Imagem é servida via `cdn.sanity.io` com transformações (`?w=800&auto=format`)
- [ ] `next/image` usado (não mais `<img>` puro) — verificar lighthouse não regrediu
- [ ] `src/data/looks.json`, `src/lib/looks.ts`, e `looks` em `src/lib/data.ts` foram removidos
- [ ] `npm run build` passa sem erro
- [ ] Deploy preview da Vercel renderiza o look corretamente

**Commits sugeridos:**
1. `feat(sanity): add look schema`
2. `feat(sanity): add looks query and helpers`
3. `feat(looks): fetch looks from sanity in server component`
4. `refactor(looks): use sanity image cdn with next/image`
5. `chore: remove legacy looks.json and blob helpers`

**Notas para o agente:**
- Se `LooksSection` for `"use client"` por causa do `useState` (modal), separe: `LooksSection` (server, busca dados) → `LooksGrid` (client, com modal/state). Passe `looks` por props.
- `LookImage` precisa receber o objeto `image` (com asset ref) ou já a URL gerada. Decidir e documentar.
- Não tente fazer Visual Editing nesta fase — é melhoria da fase 6.

---

### Fase 2 — Brands [P1]

**Objetivo**: migrar `marcasECriativos` (24 marcas) de `data.ts` para Sanity.

**Pré-requisitos**: Fase 0.

**Schema**: `src/sanity/schemas/brand.ts`
```ts
defineType({
  name: 'brand',
  title: 'Marca / Criativo',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nome / Marca', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'fullName', title: 'Nome completo', type: 'string' }),
    defineField({ name: 'segment', title: 'Segmento', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'instagram', title: 'Instagram (com @)', type: 'string' }),
    defineField({ name: 'image', title: 'Imagem (opcional)', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'order', title: 'Ordem', type: 'number', description: 'Menor aparece primeiro' }),
  ],
  orderings: [{ title: 'Manual', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
})
```

**Query**: `*[_type == "brand"] | order(order asc, name asc) { _id, name, fullName, segment, instagram, image }`

**Arquivos a modificar:**
- `src/sanity/schemas/index.ts` — registrar `brand`
- `src/components/BrandsSection.tsx` — passar a receber `brands` por props vinda do Server Component
- `src/app/page.tsx` — buscar brands
- `src/lib/data.ts` — remover `marcasECriativos` e `MarcaOuCriativo`

**Migração**: usar `mcp__Sanity__create_documents_from_json` com os 24 itens convertidos do `marcasECriativos`. Sem imagens nesta fase.

**Critério de aceite:**
- [ ] 24 brands publicadas
- [ ] `BrandsSection` renderiza idêntico ao atual
- [ ] `marcasECriativos` removido de `data.ts`
- [ ] Build passa

**Commits sugeridos:**
1. `feat(sanity): add brand schema`
2. `feat(brands): fetch from sanity`
3. `chore: remove brand data from lib/data`

---

### Fase 3 — People [P1]

**Objetivo**: migrar pessoas (modelos, equipe de produção, fotógrafos) para Sanity como tipo único `person` com campo `role`.

**Pré-requisitos**: Fase 0.

**Schema**: `src/sanity/schemas/person.ts`
```ts
defineType({
  name: 'person',
  title: 'Pessoa',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nome', type: 'string' }),
    defineField({ name: 'stageName', title: 'Nome artístico', type: 'string' }),
    defineField({
      name: 'role',
      title: 'Papel',
      type: 'string',
      options: {
        list: [
          { title: 'Modelo', value: 'model' },
          { title: 'Produção Executiva', value: 'production' },
          { title: 'Fotógrafo', value: 'photographer' },
          { title: 'Voluntário', value: 'volunteer' },
          { title: 'Apoio institucional', value: 'institutional' },
          { title: 'Parceiro', value: 'partner' },
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'instagram', title: 'Instagram (com @)', type: 'string' }),
    defineField({ name: 'image', title: 'Imagem', type: 'image', options: { hotspot: true } }),
  ],
})
```

**Queries**: queries separadas por role (`*[_type == "person" && role == "model"]` etc.)

**Arquivos a modificar:**
- `src/sanity/schemas/index.ts` — registrar `person`
- `src/components/ModelsSection.tsx` — passar a receber `models` por props
- `src/app/page.tsx` — buscar models
- `src/lib/data.ts` — remover `Pessoa`, `modelos`, `equipeProducao`, `produtoraExecutiva`

**Migração**: criar via MCP a partir de `equipeProducao` (1 pessoa) + nomes/instagrams visíveis em `creditos`.

**Critério de aceite:**
- [ ] Schema `person` no Studio
- [ ] Glícia + voluntários + fotógrafos publicados
- [ ] `ModelsSection` funciona com dados do Sanity
- [ ] Tipos pessoa removidos de `data.ts`

**Commits sugeridos:**
1. `feat(sanity): add person schema`
2. `feat(models): fetch from sanity`
3. `chore: remove person types from lib/data`

---

### Fase 4 — Credits [P2]

**Objetivo**: migrar `creditos` (5 grupos: elenco, voluntários, fotógrafos, apoio, parceiros).

**Pré-requisitos**: Fase 3 (porque os créditos podem referenciar `person`).

**Decisão de modelagem:**
- **Opção A — `creditGroup` com `people` como array de refs para `person`** (DRY, mas exige que toda pessoa exista no doc `person`).
- **Opção B — `creditGroup` com `entries` como array de objetos inline** (`{ name?, instagram? }`) — espelha o modelo atual.

**Recomendação: Opção B**, porque:
- O dado atual tem entradas só com `instagram` (sem nome).
- Não vale a pena exigir `person` doc para cada @.
- Glícia edita uma string; mais simples.

**Schema**: `src/sanity/schemas/creditGroup.ts`
```ts
defineType({
  name: 'creditGroup',
  title: 'Grupo de créditos',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'order', title: 'Ordem', type: 'number' }),
    defineField({
      name: 'entries',
      title: 'Pessoas',
      type: 'array',
      of: [{
        type: 'object',
        name: 'creditEntry',
        fields: [
          defineField({ name: 'name', title: 'Nome', type: 'string' }),
          defineField({ name: 'instagram', title: 'Instagram (com @)', type: 'string' }),
        ],
        preview: {
          select: { name: 'name', instagram: 'instagram' },
          prepare: ({ name, instagram }) => ({ title: name || instagram || 'Sem dados' }),
        },
      }],
    }),
  ],
  orderings: [{ title: 'Manual', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
})
```

**Arquivos a modificar:**
- `src/sanity/schemas/index.ts` — registrar `creditGroup`
- `src/components/CreditsSection.tsx` — receber `groups` por props
- `src/app/page.tsx` — buscar credit groups
- `src/lib/data.ts` — remover `creditos`, `CreditoGrupo`, `CreditoPessoa`

**Migração**: 5 grupos via `mcp__Sanity__create_documents_from_json`.

**Critério de aceite:**
- [ ] 5 grupos publicados
- [ ] `CreditsSection` idêntica ao comportamento atual
- [ ] `creditos` removido de `data.ts`

**Commits sugeridos:**
1. `feat(sanity): add credit group schema`
2. `feat(credits): fetch from sanity`
3. `chore: remove credits data from lib/data`

---

### Fase 5 — Event singletons [P2]

**Objetivo**: migrar `evento` e `proximoDesfile` como **singletons** (1 documento cada).

**Pré-requisitos**: Fase 0.

**Schema**: `src/sanity/schemas/event.ts`
```ts
defineType({
  name: 'event',
  title: 'Evento (atual)',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nome', type: 'string' }),
    defineField({ name: 'edition', title: 'Edição', type: 'string' }),
    defineField({ name: 'humanDate', title: 'Data (legível)', type: 'string', description: 'Ex.: "26 de Abril de 2026"' }),
    defineField({ name: 'isoDate', title: 'Data (ISO)', type: 'date' }),
    defineField({ name: 'displayDate', title: 'Data (PT-BR curta)', type: 'string', description: 'Ex.: "26/04/2026"' }),
    defineField({ name: 'location', title: 'Local', type: 'string' }),
    defineField({ name: 'concept', title: 'Conceito', type: 'text', rows: 3 }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 6 }),
    defineField({ name: 'longDescription', title: 'Descrição longa', type: 'text', rows: 8 }),
  ],
})
```

**Schema**: `src/sanity/schemas/nextEvent.ts`
```ts
defineType({
  name: 'nextEvent',
  title: 'Próximo desfile',
  type: 'document',
  fields: [
    defineField({ name: 'edition', type: 'string' }),
    defineField({ name: 'date', type: 'string', description: 'Ex.: "Entre 19 e 24 de maio"' }),
    defineField({ name: 'location', type: 'string' }),
  ],
})
```

**Singletons no Studio** — exigem customizar `structure` em `sanity.config.ts`:
```ts
// sanity.config.ts
structure: (S) =>
  S.list().title('Conteúdo').items([
    S.listItem().title('Evento atual').child(
      S.editor().id('event-current').schemaType('event').documentId('event-current')
    ),
    S.listItem().title('Próximo desfile').child(
      S.editor().id('event-next').schemaType('nextEvent').documentId('event-next')
    ),
    S.divider(),
    ...S.documentTypeListItems().filter(
      (item) => !['event', 'nextEvent'].includes(item.getId() ?? '')
    ),
  ])
```

**Arquivos a modificar:**
- `src/sanity/schemas/index.ts` — registrar `event` e `nextEvent`
- `sanity.config.ts` — adicionar `structure` customizado
- `src/components/Hero.tsx` — receber `event` por props
- `src/components/AboutSection.tsx` — receber `event` por props
- `src/components/Footer.tsx` (se usa `proximoDesfile`) — receber por props
- `src/app/page.tsx` — buscar `event` e `nextEvent`
- `src/app/layout.tsx` (se usa `evento` em metadata) — buscar via Server Component
- `src/lib/data.ts` — remover `evento`, `proximoDesfile`, tipos relacionados

**Migração**: criar 1 doc `event-current` e 1 doc `event-next` via MCP com IDs hardcoded.

**Critério de aceite:**
- [ ] Studio mostra "Evento atual" e "Próximo desfile" pinados no topo
- [ ] Hero, AboutSection, Footer renderizam dados do Sanity
- [ ] `data.ts` está 100% vazio (ou só com tipos auxiliares que sobreviveram)
- [ ] Metadata da página (se usa data do evento) também vem do Sanity

**Commits sugeridos:**
1. `feat(sanity): add event and nextEvent singleton schemas`
2. `feat(sanity): pin singletons in studio structure`
3. `feat(event): fetch event data from sanity`
4. `chore: remove event data from lib/data`

---

### Fase 6 — Cleanup, Studio polish, descomissionamento Vercel Blob [P2]

**Objetivo**: estado final limpo, Studio em PT-BR, Blob descomissionado.

**Pré-requisitos**: Fases 1–5.

**Tarefas:**

1. **Limpeza de código**:
   - [ ] Deletar `src/lib/data.ts` se vazio.
   - [ ] Deletar `src/lib/looks.ts` (se não removido na fase 1).
   - [ ] Deletar `src/data/` inteiro.
   - [ ] Remover `BLOB_BASE` ou referências a `*.public.blob.vercel-storage.com`.

2. **Polish do Studio em PT-BR**:
   - [ ] Revisar todos os schemas e ajustar `title`, `description` em cada `defineField` para PT-BR.
   - [ ] Mensagens de validação em PT-BR (`validation: (R) => R.required().error('Campo obrigatório')`).
   - [ ] `preview` configurado em todos os schemas (já feito em alguns).
   - [ ] Considerar plugin `@sanity/orderable-document-list` se Glícia quiser drag-and-drop em looks/brands.

3. **Descomissionar Vercel Blob**:
   - [ ] Confirmar que nenhuma URL `*.blob.vercel-storage.com` aparece no projeto: `grep -r "blob.vercel-storage" src/`.
   - [ ] No painel Vercel, deletar o store de Blob.

4. **Documentação**:
   - [ ] Atualizar `README.md` com seção "Editando conteúdo" apontando para `/studio`.
   - [ ] Atualizar `AGENTS.md` se necessário (ex.: mencionar que conteúdo vive no Sanity).

5. **(Opcional) Visual Editing**:
   - [ ] Adicionar Presentation tool em `sanity.config.ts` para preview lado-a-lado.
   - [ ] Adicionar `<VisualEditing />` no layout.
   - [ ] Configurar draft mode em `app/api/draft-mode/route.ts`.
   - **Nota**: requer `SANITY_API_READ_TOKEN`. Adicione apenas se Glícia pediu.

**Critério de aceite:**
- [ ] `grep -r "blob.vercel-storage" src/` retorna vazio
- [ ] `src/lib/data.ts` deletado ou vazio
- [ ] `src/data/` deletado
- [ ] Studio em PT-BR (revisão visual)
- [ ] Vercel Blob store deletado no painel
- [ ] README atualizado

**Commits sugeridos:**
1. `chore: remove legacy data files`
2. `chore(sanity): translate studio fields to pt-br`
3. `docs: explain content editing via sanity studio`
4. `feat(sanity): add presentation tool for visual editing` (opcional)

---

## 9. Glossário

- **Dataset**: namespace de conteúdo dentro de um projeto Sanity. Análogo a um banco. No free, podemos ter até 2.
- **Document**: registro JSON com `_type` e `_id`. Equivalente a uma "linha" tipada.
- **GROQ**: linguagem de query. `*[_type == "look"]` retorna todos os looks.
- **Schema**: definição de tipo via `defineType`/`defineField`. Vive em código TS.
- **Studio**: app React de edição. Embedada em `/studio`.
- **Asset**: arquivo (imagem, PDF) no asset CDN. Referenciado em documentos via `asset` field.
- **Hotspot**: ponto focal de uma imagem para crops responsivos.
- **TypeGen**: ferramenta CLI da Sanity que gera tipos TS a partir do schema + queries GROQ.
- **CDN**: `cdn.sanity.io` — domínio que serve assets com transformações.
- **Singleton**: documento único (ex.: configuração do site). No Sanity é só um doc com ID hardcoded e UI customizada para esconder o "criar novo".

---

## 10. Apêndice — variáveis de ambiente

| Var                              | Onde                              | Valor                                                                |
| -------------------------------- | --------------------------------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | local + Vercel (preview, prod)    | ID retornado por `create_project`                                    |
| `NEXT_PUBLIC_SANITY_DATASET`     | local + Vercel (preview, prod)    | `production`                                                         |
| `NEXT_PUBLIC_SANITY_API_VERSION` | local + Vercel (preview, prod)    | `2026-04-27` (data de hoje, fixa)                                    |
| `SANITY_API_READ_TOKEN`          | Vercel (preview, prod) — opcional | Token Viewer, gerado em manage.sanity.io. Só se for usar draft mode. |

---

## 11. Fora de escopo (não fazer agora)

- Internacionalização (EN). Será considerado em PRD futuro.
- Comentários, tasks, scheduled drafts (precisam Growth plan).
- Sanity Live Content / streaming (overkill).
- Sanity Functions / Blueprints / event handlers.
- Migração programática de imagens em batch (faremos se virar problema).
