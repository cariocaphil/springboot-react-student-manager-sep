# Modernization roadmap

Build history for the Student Manager modernization.

PR numbers match merged GitHub pull requests. Future work continues from PR 22.

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

PR 2 — Project baseline documentation ✅
- [x] Add root README (stack, local setup, CI/CD, Elastic Beanstalk overview)
- [x] Add `docs/architecture.md` (as-is architecture + technical debt)
- [x] Add this roadmap in PR build-history format
- [x] Add `AGENTS.md` (shared agent guidance) and `CLAUDE.md` (Claude-specific entrypoint)

PR 3 — Upgrade CI GitHub Actions (`build.yml`) ✅
- [x] Upgrade `actions/checkout` v2 → v4
- [x] Upgrade `actions/setup-java` v1.4.3 → v5 (Temurin, Java 11)
- [x] Keep Maven/frontend package step and Postgres 13.1 service unchanged
- [x] Leave `deploy.yml`, secrets, EB, and application stack untouched

PR 4 — Upgrade CICD GitHub Actions (`deploy.yml`) ✅
- [x] Upgrade `actions/checkout` v2 → v4
- [x] Upgrade `actions/setup-java` v1.4.3 → v5 (Temurin, Java 11)
- [x] Replace deprecated `::set-output` with `$GITHUB_OUTPUT`
- [x] Remove invalid leading `YAML` token / normalize workflow indentation so the file parses
- [x] Keep commit-back of compose image tag, EB deploy, Slack, Docker Hub push, and app stack unchanged
- [x] Leave secrets, region/image-name drift, and application code for later PRs

PR 5 — Fix Jib Java 11 base image ✅
- [x] Replace obsolete `openjdk:11` Jib `from` image with `eclipse-temurin:11-jre`
- [x] Keep Jib 2.5.2, Java 11, Docker Hub target `cariocaphil/spring-react-fullstack`, and EB flow unchanged
- [x] Do not change credentials, region/image-name drift, or unrelated dependencies

PR 6 — Upgrade Jib for Temurin OCI image indexes ✅
- [x] Upgrade `jib-maven-plugin` 2.5.2 → 3.5.2 so Jib can resolve `eclipse-temurin:11-jre` OCI indexes
- [x] Keep `eclipse-temurin:11-jre`, Java 11, Spring Boot 2.5.4, Hub target, and EB behavior unchanged
- [x] Do not upgrade other dependencies or change credentials / deploy drift

PR 7 — Fix deploy compose image-tag update ✅
- [x] Point `deploy.yml` tag `sed` at `cariocaphil/spring-react-fullstack` (was stale `amigoscode/springboot-react-fullstack`)
- [x] Fail the job if the compose file does not contain the new `BUILD_NUMBER` tag before commit-back
- [x] Keep commit-back, Hub repo name, credentials, region, EB, and app/Jib versions unchanged

PR 8 — Align deploy AWS region ✅
- [x] Set `AWS_REGION` to `eu-central-1` for Elastic Beanstalk deploy

PR 9 — Align Elastic Beanstalk environment name ✅
- [x] Set `EB_ENVIRONMENT_NAME` to `springboot-react-fullstack-env`

PR 10 — Update restored RDS endpoint ✅
- [x] Point `application-dev.properties` at the restored RDS endpoint

PR 11 — Fix Slack deploy notifications ✅
- [x] Docker Hub Slack text/link use `cariocaphil/spring-react-fullstack` (not legacy `amigoscode/…`)
- [x] Confirm final EB Slack URL remains `springbootreactfullstack-env` in `eu-central-1`
- [x] Keep `8398a7/action-slack@v3`, webhook secret, and deploy/commit-back logic unchanged

PR 12 — Move DB credentials to environment variables ✅
- [x] Replace committed RDS URL/user/password in `application-dev.properties` with required `SPRING_DATASOURCE_*` placeholders
- [x] Keep local/CI defaults via placeholders in `application.properties`
- [x] Pass datasource env vars through `elasticbeanstalk/docker-compose.yml` (values set on EB / host — not in git)
- [x] Document required env vars; credential rotation completed in AWS/EB (ops); history scrub remains optional
- [x] Do not change Boot/Java/Jib, Hub image names, commit-back, or region/EB deploy logic

PR 13 — Stop CI commit-back of compose image tags ✅
- [x] Update compose image tag in the deploy job for the EB package only (keep `sed` + guard)
- [x] Remove `git commit` / `git push` of `elasticbeanstalk/docker-compose.yml` from `deploy.yml`
- [x] Leave Hub push, EB deploy, Slack, secrets, and app stack unchanged

PR 14 — Backend unit and integration tests ✅
- [x] Add `StudentServiceTest` (email taken, delete missing, happy paths) with Mockito
- [x] Add `StudentRepositoryTest` for `selectExistsEmail` against Postgres
- [x] Add `StudentIntegrationTest` (MockMvc GET/POST/DELETE, duplicate email, 404)
- [x] Add `src/test/resources/application.properties` for test DB settings
- [x] Keep Boot/Java/Jib and deploy behavior unchanged

PR 15 — Java 17 toolchain (Boot 3 prep) ✅
- [x] Raise Maven `java.version` and CI/CICD `JAVA_VERSION` to **17**
- [x] Move Spring Boot parent **2.5.4 → 2.7.18** (supported on Java 17; still `javax.*`)
- [x] Jib base image `eclipse-temurin:11-jre` → `eclipse-temurin:17-jre`
- [x] Keep React/CRA, Hub image name, EB flow, and datasource env config unchanged
- [x] Leave Spring Boot 3 / `jakarta.*` for PR 16

PR 16 — Spring Boot 3
- [x] Upgrade Spring Boot parent **2.7.18 → 3.4.5**
- [x] Migrate persistence/validation imports `javax.*` → `jakarta.*`
- [x] Keep Java 17, Temurin 17 Jib base, Hub/EB/deploy, and React stack unchanged
- [x] Verify backend tests against Postgres

PR 17 — CRA → Vite
- [x] Replace `react-scripts` with Vite 5 + `@vitejs/plugin-react`
- [x] Keep React 17 / Ant Design 4; Maven still copies `src/frontend/build` → `target/classes/static`
- [x] Bump `frontend-maven-plugin` Node to **20** (Vite requirement)
- [x] Dev proxy `/api` → `localhost:8080` via `vite.config.js`
- [x] Add Vitest smoke test for empty student list; run via Maven `npm test`; drop unused `yarn.lock`

PR 18 — Expand Vitest suite
- [x] Cover `client` helpers (GET/POST/DELETE + non-OK rejection)
- [x] Cover notification wrappers and `StudentDrawerForm` (validation, create success/error)
- [x] Expand `App` tests (list rows, list error, delete confirm, drawer open, footer link)
- [x] Add jsdom `matchMedia` / `getComputedStyle` shims for Ant Design in Vitest

PR 19 — Migrate frontend to TypeScript
- [x] Add TypeScript + `@types/react` / `@types/react-dom` (React 17)
- [x] Convert UI/client sources and Vitest suite to `.ts` / `.tsx`
- [x] Add `tsconfig.json` / `vite.config.ts`; `npm run build` runs `tsc --noEmit` then Vite
- [x] Keep React 17 / Ant Design 4 / Maven `build/` → static packaging unchanged

PR 20 — React 18 upgrade
- [x] Upgrade `react` / `react-dom` **17 → 18.3.1** (latest stable on Ant Design 4; React 19 needs Ant Design 5)
- [x] Switch entry mounting to `createRoot` (required ReactDOM 18 API)
- [x] Align related deps: `@types/react` 18, `@testing-library/react` 14, Ant Design **4.24.16** (React 18 fixes)
- [x] Keep Vite/TS/Maven packaging and app behavior unchanged

PR 21 — React architecture refactor ✅
- [x] Separate shell (`AppLayout`) from students feature (`StudentsView` + `useStudents`)
- [x] Make `client` return typed domain data; centralize HTTP error → notification formatting (`apiError`, `notifyUnexpectedError` fallback)
- [x] Single drawer instance; clearer drawer props (`open` / `onClose` / `onCreate`); move create into `useStudents`
- [x] Extract presentational leaves (table/columns/actions/avatar/empty/add button/drawer footer; layout sidebar/footer)
- [x] Group UI under `components/layout` and `components/students`; split `types` into student / api / notification; extract `apiRoutes`
- [x] Preserve UI/behavior; extend Vitest for apiError, hooks, student/layout leaves, and App flows
