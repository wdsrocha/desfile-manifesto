# PRD 004 — Crop 9:16 da capa com hotspot do Sanity

> Status: Draft
> Autor: Wesley Rocha
> Data: 2026-05-03
> Audiência: Wesley (decisor) e agentes de codificação executando fases isoladas

---

## 1. Sumário executivo

A capa de cada look na grid da home (`LooksSection`) hoje é a primeira imagem do array `images`, renderizada num container `aspect-[9/16]` com `object-cover` no CSS. Imagens com aspect ratio diferente de 9:16 acabam recortadas pelo navegador, **ignorando o hotspot** definido no Studio. Esta spec move o recorte do CSS para o **CDN do Sanity**, que respeita o hotspot/crop por imagem. O modal/carrossel continua mostrando a imagem inteira sem mudanças.

**Estado final**: `LookImage` aceita uma prop opcional `aspectRatio: [w, h]`. Quando fornecida, a URL gerada pelo `@sanity/image-url` aplica `.width(W).height(H).fit('crop')`, e o CDN devolve uma versão já recortada usando o hotspot do editor. `LooksSection` passa `aspectRatio={[9, 16]}` no thumbnail. `LookCarousel` não muda — continua entregando `.fit('max')` com a imagem inteira. Editores definem o hotspot da capa de cada look uma única vez no Studio.

---

## 2. Decisões já tomadas (não revisitar sem justificativa)

| Decisão                          | Valor                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Origem do recorte                | CDN do Sanity via `@sanity/image-url` (`.fit('crop')`), não CSS                                        |
| Schema                           | Sem mudanças. `options: { hotspot: true }` já existe em `look.images[]`                                |
| Capa                             | Continua sendo `images[0]`. Sem campo separado, sem item "fake" no array                               |
| Aspect ratio da capa             | 9:16 fixo (alinhado ao `aspect-[9/16]` que já enquadra o thumbnail)                                    |
| API do componente                | Prop opcional `aspectRatio?: [number, number]` em `LookImage`. Sem ela, comportamento atual preservado |
| `LookCarousel`                   | Não muda. Continua entregando imagem inteira (`.fit('max')`)                                           |
| Largura da URL de capa           | `width(900)` — cobre 2x para a maior largura de thumbnail (~22vw em lg)                                |
| Hotspot dos looks já cadastrados | Definido manualmente no Studio em fase editorial após o deploy da Fase 1                               |
| Fallback sem hotspot definido    | Comportamento default do CDN (recorte centrado). Sem flag de UI no front                               |

---

## 3. Arquitetura / modelo mental

**Pipeline atual (CSS recorta, hotspot ignorado):**
```
Sanity asset (qualquer ratio)
  └─ urlForImage().width(1200).quality(75)           ← .fit('max') herdado, sem crop
  └─ <Image fill className="object-cover">            ← navegador corta visualmente
  └─ container aspect-[9/16]                          ← define a janela
        ↳ recorte centrado pelo CSS, hotspot ignorado
```

**Pipeline proposto (CDN recorta, hotspot respeitado):**
```
Sanity asset (qualquer ratio)
  └─ urlForImage().width(900).height(1600).fit('crop').quality(75)
        ↳ CDN do Sanity respeita hotspot definido no Studio
  └─ <Image fill className="object-cover">            ← no-op (imagem já é 9:16)
  └─ container aspect-[9/16]                          ← match exato
```

**Modal / carrossel** (sem mudanças):
```
Sanity asset (qualquer ratio)
  └─ urlForImage().width(1200).quality(75)           ← .fit('max'), imagem inteira
  └─ <Image fill object-cover|object-contain>         ← decisão por aspect ratio (já existe)
```

**Onde cada `.fit()` vem:** `urlForImage` em `src/sanity/image.ts` retorna um builder com `.fit('max')` aplicado. O builder do `@sanity/image-url` permite **sobrescrever** chamadas anteriores — quando consumimos `.fit('crop')` no `LookImage`, vence o último `.fit()`.

---

## 4. Convenções

- A prop `aspectRatio` é **opt-in**. Componente sem essa prop = mesma URL de hoje. Isso preserva todos os outros usos (`LookCarousel`, `PortraitCard` se aplicável).
- A prop é uma tupla `[w, h]` em vez de string ou objeto, para deixar clara a relação com a chamada `.width(w * k).height(h * k).fit('crop')`.
- A largura concreta enviada ao CDN é calculada por uma constante interna do `LookImage` (`COVER_CROP_WIDTH = 900`) — não é responsabilidade do consumidor passar pixel size.
- Não introduzir um `LookCover` separado. A diferença é uma URL e nada mais; um wrapper seria over-engineering.
- A chamada `.quality(75)` continua aplicada igual ao caminho atual, garantindo paridade de cache com qualquer outra renderização que use a mesma URL.
- Não tocar no `urlForImage` global. Manter `.fit('max')` como default — é o comportamento esperado em todos os consumidores que não pedem crop.

---

## 5. Estratégia de ambientes

Sem mudanças. Sem novas envs. Sem mudanças de CORS. Sem novos webhooks. A renderização é estática a partir do CDN do Sanity, mesmo dataset `production` em todos os ambientes (decisão do PRD 001).

---

## 6. Restrições técnicas / limites externos

- **`@sanity/image-url`**: a ordem das chamadas no builder importa apenas para `.fit()`/`.crop()` (last wins). `.width()` e `.height()` são aditivas — quando ambas estão presentes com `.fit('crop')`, o CDN aplica crop respeitando o hotspot.
- **CDN do Sanity**: gera assets transformados sob demanda e cacheia. URLs determinísticas → primeira visita paga o transform, seguintes são edge cache hits.
- **LCP**: a capa continua sendo o LCP candidato. A versão recortada é mais leve em bytes do que a `.fit('max').width(1200)` atual (menor área), o que ajuda o LCP ao invés de prejudicar.
- **Hotspot default**: imagens sem hotspot definido no Studio caem no comportamento do CDN — recorte centrado. Não é regressão: é o que o CSS faz hoje, só que com bytes a menos.

---

## 7. Riscos e mitigações

| Risco                                                                  | Probabilidade | Mitigação                                                                                                              |
| ---------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Imagens existentes sem hotspot definido cortam diferente do esperado   | Médio         | Default do CDN é centro — paridade visual com hoje. Wesley/Glícia revisam capa por capa no Studio após deploy          |
| `urlForImage` não sobrescrever `.fit('max')` herdado                   | Baixo         | Documentado no `@sanity/image-url`: last `.fit()` wins. Smoke test no preview antes de produção                        |
| Aspect ratio do CSS divergir do crop do CDN (ex.: arredondamento)      | Baixo         | Container usa `aspect-[9/16]` e URL pede `900×1600` (proporção exata). `object-cover` absorve qualquer 1px de diferença |
| Cache miss desnecessário porque a URL muda em renders diferentes       | Baixo         | Largura é constante por componente. Mesma `width`/`height`/`quality` → mesma URL                                       |
| `LookViewer` herdar a prop `aspectRatio` por engano e cortar no modal  | Médio         | A prop é explícita e não é injetada em lugar nenhum por default. Cobertura por revisão na Fase 1                       |

---

## 8. Roteiro de fases

> Como ler: cada fase é auto-contida. Um agente executa uma fase lendo apenas:
> este PRD, AGENTS.md, a fase corrente e os arquivos listados em "Arquivos tocados".

### Status das fases

| Fase | Título                                       | Prioridade | Status |
| ---- | -------------------------------------------- | ---------- | ------ |
| 1    | Crop com hotspot na capa (técnico)           | P0         | ⬜      |
| 2    | Definição editorial de hotspots no Studio    | P1         | ⬜      |

---

### Fase 1 — Crop com hotspot na capa [P0]

**Objetivo**: a capa exibida na grid da home passa a ser entregue pelo CDN do Sanity já no aspect ratio 9:16, respeitando o hotspot por imagem. Modal e carrossel continuam idênticos.

**Pré-requisitos**: nenhum.

**Arquivos a criar:** nenhum.

**Arquivos a modificar:**
- `src/components/LookImage.tsx`
  - Adicionar prop opcional `aspectRatio?: [number, number]`.
  - Definir constante interna `const COVER_CROP_WIDTH = 900`.
  - Quando `aspectRatio` é fornecido, montar a URL como
    `urlForImage(image).width(COVER_CROP_WIDTH).height(Math.round(COVER_CROP_WIDTH * h / w)).fit('crop').quality(75).url()`.
  - Quando ausente, manter exatamente a URL atual (`.width(1200).quality(75)` herdando `.fit('max')`).
  - Não tocar no JSX nem no `object-cover`/`object-contain` — eles seguem como estão.
- `src/components/LooksSection.tsx`
  - Passar `aspectRatio={[9, 16]}` no `<LookImage>` do thumbnail (linha ~75).
  - Não mexer no `aspect-[9/16]` do CSS — ele permanece como container/garantia.

**Arquivos a deletar:** nenhum.

**Tarefas externas:** nenhuma.

**Migração de conteúdo:** nenhuma. Imagens existentes sem hotspot caem no recorte centrado do CDN — paridade visual com o estado atual.

**Critérios de aceitação:**
- [ ] DevTools Network: a URL da capa contém `?...&w=900&h=1600&fit=crop&q=75` (ou equivalente do builder).
- [ ] A URL no carrossel **não** contém `fit=crop` — segue como `fit=max`.
- [ ] Para um look com hotspot definido manualmente no Studio (validação manual), a capa enquadra a região do hotspot.
- [ ] Para looks sem hotspot, a capa segue visualmente próxima do estado anterior (recorte centrado).
- [ ] Modal abre com a imagem inteira (sem crop), idêntico ao comportamento de hoje.
- [ ] `tsc --noEmit` limpo. `npm run build` passa.
- [ ] Lighthouse local: LCP candidate continua sendo a capa; bytes da capa não aumentaram.

**Commits sugeridos:**
1. `feat(look-image): support sanity hotspot crop via aspectRatio prop`
2. `feat(looks): use 9:16 hotspot crop for cover thumbnails`

**Notas para o agente:**
- O builder `@sanity/image-url` aceita chamadas encadeadas; a última `.fit()` ganha. Não é necessário "limpar" o `.fit('max')` herdado de `urlForImage`.
- **Não** introduza um componente `LookCover` nem reescreva o `LookImage` para suportar múltiplos modos. A diferença é uma URL.
- **Não** mude `src/sanity/image.ts`. O `.fit('max')` default protege os outros consumidores.
- A prop é uma tupla `[w, h]`. Qualquer outro shape (string `"9:16"`, objeto `{ width, height }`) é desnecessário e fica fora de escopo.
- O `LookImage` não precisa virar `client component` — ele já é renderizado dentro de um, e a transformação de URL é pura.
- Antes de codar, confira na doc oficial do `@sanity/image-url` (`node_modules/@sanity/image-url/...`) que a ordem `.width().height().fit('crop')` é a forma canônica de pedir crop com hotspot. Não confie em memória.

---

### Fase 2 — Definição editorial de hotspots no Studio [P1]

**Objetivo**: cada look com capa cuja imagem original não é 9:16 tem o hotspot ajustado manualmente no Studio para garantir um enquadramento intencional.

**Pré-requisitos**: Fase 1 em produção.

**Arquivos a criar/modificar/deletar:** nenhum (fase editorial).

**Tarefas externas:**
1. Wesley/Glícia listam no Studio os looks publicados.
2. Para cada `look.images[0]`, abrir o crop/hotspot tool do Sanity.
3. Posicionar o foco (rosto/torso) no hotspot. Ajustar crop se a imagem original tiver bordas a remover.
4. Publicar a alteração.
5. Conferir no site (preview ou prod) que a capa ficou enquadrada como esperado.

**Migração de conteúdo:** nenhuma. Hotspot é metadado da imagem, salvo dentro do `look.images[i]` automaticamente pelo Studio.

**Critérios de aceitação:**
- [ ] Todos os looks publicados em produção tiveram o hotspot da capa revisado.
- [ ] Nenhum look com cabeça/peça-chave cortada na grid da home.

**Commits sugeridos:** não aplicável (mudanças de conteúdo, não de código).

**Notas para o agente:**
- Esta fase **não envolve agentes de código**. É um runbook editorial. Mantida no PRD para fechar o ciclo.
- Se o conteúdo já tiver dezenas de looks na época do execute, pode-se priorizar pelos looks visíveis acima da dobra primeiro.

---

## 9. Glossário

- **Hotspot**: ponto focal definido por imagem no Studio (`options: { hotspot: true }` no schema). O CDN do Sanity respeita-o ao gerar versões com `.fit('crop')`.
- **Crop (CDN)**: recorte feito pelo `@sanity/image-url` via querystring `?w=…&h=…&fit=crop`. Determinístico e cacheável.
- **Crop (CSS)**: recorte visual feito pelo navegador via `object-cover` num container com `aspect-ratio`. Ignora hotspot.
- **Capa**: `look.images[0]`. Renderizada na grid da home com `priority` nos 4 primeiros cards.
- **`aspectRatio` (prop)**: tupla `[w, h]` que ativa o crop no CDN dentro do `LookImage`. Opt-in.

---

## 10. Apêndice — Configuração

Sem novas variáveis de ambiente. Sem mudanças em `vercel.json`/`vercel.ts`. Sem mudanças em CORS do Sanity.

---

## 11. Fora de escopo (não agora)

- Aspect ratios variáveis na grid (ex.: 4:5, 1:1). Mantemos 9:16 fixo até prova em contrário.
- Cropper customizado no Studio. O nativo do Sanity é suficiente.
- Aplicar crop com hotspot em outras superfícies (`PortraitCard`, eventuais futuras seções). Cada uma decide ao adotar a prop.
- Servir múltiplas resoluções via `srcset` manual. O `next/image` cuida disso a partir da URL base.
- Pré-geração estática de versões cropadas em build. CDN do Sanity já cacheia no edge.

---

## 12. Trade-offs discutidos

**Onde fazer o recorte da capa**
- **Opção A (escolhida)**: CDN do Sanity (`.fit('crop')`) com hotspot. Escolhida porque: respeita decisão editorial por imagem, sem CSS hack, sem upload duplicado, sem novo campo. Bytes menores entregues ao cliente.
- **Opção B**: manter `object-cover` no CSS. Rejeitada porque: ignora hotspot — exatamente o problema que motivou esta spec.
- **Opção C**: editor recorta manualmente fora do Sanity e faz upload da capa como imagem separada. Rejeitada porque: dobra trabalho editorial, dobra storage, e cada nova capa precisa ser regerada se a estética mudar.

**Onde guardar a capa (se fosse imagem distinta — Opção C acima)**
- **Sub-opção C.1**: novo campo `cover: image` no schema. Rejeitada (junto da C) porque: introduz divergência potencial entre capa e galeria.
- **Sub-opção C.2**: usar `images[0]` como capa "fake" e ocultá-la no carrossel. Rejeitada (junto da C) porque: "ocultar baseado em índice" é frágil — qualquer reorder no Studio quebra a regra.

**Forma da API do `LookImage`**
- **Opção A (escolhida)**: prop opcional `aspectRatio: [w, h]`. Escolhida porque: opt-in, retro-compatível, deixa explícito no call site qual é a intenção do consumidor.
- **Opção B**: novo componente `LookCover`. Rejeitada porque: a única diferença é a URL — wrapper só pra chamar a prop é over-engineering.
- **Opção C**: detectar automaticamente o aspect ratio do container e gerar a URL correspondente. Rejeitada porque: depende de medir DOM no client e adia a URL final, prejudicando SSR/LCP.

**Largura da URL de capa**
- **Opção A (escolhida)**: 900px fixo (com 1600 de altura, mantendo 9:16). Escolhida porque: cobre 2x retina para o maior thumbnail (~22vw em lg) e é uma constante simples.
- **Opção B**: usar `srcset` manual com várias larguras. Rejeitada porque: `next/image` já faz responsive sizing a partir do `sizes`. Adicionar manualmente é redundante.
- **Opção C**: derivar do `sizes` prop. Rejeitada porque: complexifica o componente sem benefício mensurável neste caso (galerias pequenas, CDN cacheia).
