# PRD NNN — [Feature Name]

> Status: [Draft | In Review | Approved | In Progress | Done]
> Author: [Name]
> Date: YYYY-MM-DD
> Audience: [Decision maker(s)] and coding agents executing isolated phases

---

## 1. Executive Summary

[2–3 sentences: what problem is solved, the end state, and the strategy (incremental? big bang?).]

**End state**: [Concrete list of what will exist/not exist and who can do what.]

---

## 2. Locked Decisions (do not revisit without justification)

| Decision | Value |
| -------- | ----- |
| ...      | ...   |

---

## 3. Architecture / Mental Model

[How the pieces fit together. ASCII data-flow diagrams. Reading flow, write flow, editorial flow.]

---

## 4. Conventions

[Naming rules, file structure, what NOT to do. Include a "why" for non-obvious choices.]

---

## 5. Environment Strategy

[How local/preview/prod differ. Required env vars. External service config (CORS, webhooks).]

---

## 6. Technical Constraints / External Limits

[Plan limits, rate limits, size limits. What decisions these constraints drove.]

---

## 7. Risks and Mitigations

| Risk | Probability  | Mitigation |
| ---- | ------------ | ---------- |
| ...  | Low/Med/High | ...        |

---

## 8. Phase Roadmap

> How to read: Each phase is self-contained. An agent should execute one phase reading only:
> this PRD, AGENTS.md, the current phase, and the files listed in "Files touched."

### Phase status

| Phase | Title | Priority | Status |
| ----- | ----- | -------- | ------ |
| 0     | ...   | P0       | ⬜      |

---

### Phase N — [Title] [P0/P1/P2]

**Objective**: [One sentence.]

**Prerequisites**: [Phase N, or "none".]

**Files to create:**
- `path/to/file.ts` — purpose

**Files to modify:**
- `path/to/file.ts` — what changes

**Files to delete:**
- `path/to/file.ts`

**External tasks** (APIs, third-party services, manual steps):
1. Step

**Content / data migration:**
[What data moves, from where, to where, how.]

**Acceptance criteria:**
- [ ] Verifiable condition

**Suggested commits:**
1. `type(scope): description`

**Agent notes:**
- Gotchas, non-obvious decisions, traps.

---

## 9. Glossary

- **Term**: definition.

---

## 10. Appendix — Configuration

| Variable | Environments           | Value       |
| -------- | ---------------------- | ----------- |
| `VAR`    | local + preview + prod | description |

---

## 11. Out of Scope (not now)

- Thing that looks in-scope but isn't.

---

## 12. Trade-offs Discussed

[Document alternatives that were seriously considered and why they were rejected. This prevents relitigating closed debates and gives future readers the reasoning behind §2.]

**[Topic]**
- **Option A (chosen)**: description. Chosen because: reason.
- **Option B**: description. Rejected because: reason.
