# AGENTS.md

Shared instructions for coding agents (Cursor, Claude, Codex, etc.) working in this repository.

Claude-specific notes live in [CLAUDE.md](CLAUDE.md). Human-oriented Status and runbooks live in [README.md](README.md).

## Project

Spring Boot + React student manager: Java 11 / Spring Boot 2.5.4 API, CRA React 17 UI bundled into one JAR/container, CI/CD to Docker Hub + AWS Elastic Beanstalk.

## Required reading

Before changing runtime behavior, read:

| Doc | Use for |
| --- | --- |
| [README.md](README.md) | Short Status, local run, stack |
| [docs/architecture.md](docs/architecture.md) | As-is architecture and recorded debt |
| [docs/modernization-roadmap.md](docs/modernization-roadmap.md) | PR build-history checklist (what shipped / what’s next) |

## Working rules

1. **Roadmap-first.** Prefer the next open PR theme in `docs/modernization-roadmap.md`. Do not jump to later phases (Boot 3, Vite, ECS) unless the user asks.
2. **Docs vs code.** If the task is documentation-only, do not upgrade, refactor, fix, or remove application, infrastructure, dependency, or CI/CD code. Record debt instead of “helpfully” fixing it.
3. **Current vs target.** Keep as-is behavior in `architecture.md` / README Status. Put planned work only in the roadmap checklist. When a PR merges, mark items `[x]` / add `✅` and bump “Future work continues from PR N”.
4. **Small PRs.** One theme per PR (secrets, tests, Boot upgrade, frontend, etc.). Leave the app deployable unless a cutover is explicit.
5. **No drive-by cleanup.** Match existing style; don’t rename packages, rewrite UI, or tidy unrelated files.
6. **Secrets.** Credentials in `application-dev.properties` are known debt. Do not print, commit new secrets, or “fix” them by hardcoding replacements. Prefer env / EB / Secrets Manager when that PR is in scope.
7. **Commands.** Use `./mvnw` (not a global Maven). Frontend lives under `src/frontend`. Full package: `./mvnw clean package -P build-frontend`.
8. **Git.** Never commit (or push / open a PR) unless the user explicitly asks. Default end state for finished work: **stage** relevant files only (`git add`), leave the commit uncreated, and **propose** a commit message (and PR title when useful) in the reply. If the user later asks to commit, use that proposal via HEREDOC. Don’t amend pushed commits or force-push `main`.

## Layout

| Path | Role |
| --- | --- |
| `src/main/java/com/example/demo/` | Spring Boot API (`student` package) |
| `src/main/resources/` | `application.properties`, `application-dev.properties` |
| `src/frontend/` | CRA React app |
| `elasticbeanstalk/docker-compose.yml` | EB deploy package |
| `.github/workflows/` | `build.yml` (PR CI), `deploy.yml` (main → Hub → EB) |
| `pom.xml` | Maven, frontend plugin, Jib profiles |
| `docs/` | Architecture + modernization roadmap |
| `AGENTS.md` / `CLAUDE.md` | Agent guidance (shared / Claude-specific) |

## Stack constraints (until upgraded)

- Backend: Java 11, Spring Boot 2.5.x, `javax.*`, JPA entity exposed as API
- Frontend: React 17, `react-scripts` 4, Ant Design 4, relative `api/v1/students` via `unfetch`
- Image: Jib → `cariocaphil/spring-react-fullstack`; compose may pin a numeric tag
- Deploy profile: `SPRING_PROFILES_ACTIVE=dev` on EB

Known inconsistencies (debt — fix only in the dedicated PR): region/image-name drift in `deploy.yml` vs compose/Slack; invalid `YAML` preamble on `deploy.yml`; aging Actions versions.

## After finishing a modernization PR

1. Update checklist items in `docs/modernization-roadmap.md`
2. Refresh README **Status** (current / next)
3. Adjust `docs/architecture.md` if runtime behavior changed
