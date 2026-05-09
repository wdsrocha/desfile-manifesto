<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Git: worktree setup

When creating a new worktree, copy these gitignored files from the main worktree:

- `.env.local` — secrets and API keys
- `.vercel/` — project link (org/project IDs) for the Vercel CLI

# Git: atomic commits, Conventional Commits, English

Each commit must represent a single logical change. Use the Conventional Commits format (`type(scope): description`) and write all commit messages in English.

Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `ci`, `style`, `test`.
