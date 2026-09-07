# CLAUDE.md

Claude-specific entrypoint for this repo. **Shared agent rules, layout, and stack constraints live in [AGENTS.md](AGENTS.md)** — read that first and follow it.

## Role of this file

- Point Claude at the canonical agent guide (`AGENTS.md`) and human docs.
- Call out Claude Code / Claude-in-IDE preferences that are not universal.

## Always load

1. [AGENTS.md](AGENTS.md) — working rules and repo map
2. [docs/modernization-roadmap.md](docs/modernization-roadmap.md) — next PR theme
3. [docs/architecture.md](docs/architecture.md) — when touching runtime or deploy paths
4. [README.md](README.md) — Status + local commands

## Claude preferences

- Prefer editing the smallest set of files that satisfy the user’s ask; don’t expand scope into later roadmap PRs.
- When the user asks for docs-only work, refuse incidental code fixes even if debt is obvious — link or list debt in `architecture.md` / the roadmap instead.
- For explanations, cite paths and the roadmap PR section rather than restating the whole architecture.
- If both a fix and a speculative modernization are possible, do the fix that matches the current open PR theme only.
- Keep answers short unless the user asks for detail; put durable decisions into `docs/` rather than chat-only advice.
- After code or docs changes: stage files, do **not** commit; include a proposed commit message in the summary (see [AGENTS.md](AGENTS.md) Git rule).

## Do not duplicate

Do not copy the full working-rules list, layout table, or stack constraints into this file. Update [AGENTS.md](AGENTS.md) when those change so every agent stays aligned.
