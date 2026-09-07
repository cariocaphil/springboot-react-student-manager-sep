# Modernization roadmap

Build history for the Student Manager modernization.

PR numbers match merged GitHub pull requests. Future work continues from PR 3.

The README keeps a short Status summary; this file holds the full checklist.

Current behavior lives in [architecture.md](architecture.md). This file is the checklist of what shipped and what comes next.

Legacy application (pre-modernization) ✅
- [x] Spring Boot 2.5.4 API with Java 11, JPA, Bean Validation, Lombok
- [x] Student CRUD-ish domain (`GET`/`POST`/`DELETE` at `/api/v1/students`)
- [x] Create React App frontend (React 17, Ant Design 4) bundled into the JAR
- [x] Maven `build-frontend` + Jib profiles for Docker Hub image `cariocaphil/spring-react-fullstack`
- [x] GitHub Actions CI (`build.yml`) and CICD deploy to Elastic Beanstalk (`deploy.yml`)
- [x] EB Docker Compose single-service deploy with `SPRING_PROFILES_ACTIVE=dev` → RDS
- [x] Local Postgres config and committed `application-dev.properties` (debt recorded, not fixed here)

PR 1 — UI Footer ✅
- [x] Add footer / course link on the UI
- [x] Add `rel="noreferrer"` on the external link

PR 2 — Project baseline documentation
- [x] Add root README (stack, local setup, CI/CD, Elastic Beanstalk overview)
- [x] Add `docs/architecture.md` (as-is architecture + technical debt)
- [x] Add this roadmap in PR build-history format
- [x] Add `AGENTS.md` (shared agent guidance) and `CLAUDE.md` (Claude-specific entrypoint)
