# Manifesto — Landing Page

Landing page editorial para o desfile **Manifesto**, com créditos completos a marcas, modelos e produção.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>.

## Build de produção

```bash
npm run build
npm start
```

## Notas

- Dados consumidos de mock estático em `src/lib/data.ts` (sem backend).
- Imagens ficam em `/public` e são referenciadas por caminho relativo.
- Otimizado para mobile (acesso via QR Code durante o evento).
