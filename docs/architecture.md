# Architecture — current baseline

This document describes the **as-is** architecture of the student manager application. It is the baseline for modernization. Planned changes belong in [modernization-roadmap.md](modernization-roadmap.md); nothing here implies those changes have been applied.

## 1. System context

```text
┌─────────────┐     HTTP      ┌──────────────────────────────────────┐
│  Browser    │──────────────▶│  Spring Boot process (port 8080)     │
│  (React UI) │◀──────────────│  • Static SPA (production package)   │
└─────────────┘               │  • REST API /api/v1/students         │
                              └──────────────────┬───────────────────┘
                                                 │ JDBC
                                                 ▼
                              ┌──────────────────────────────────────┐
                              │  PostgreSQL                          │
                              │  local: localhost / DB cariocaphil   │
                              │  deploy: AWS RDS (dev profile)       │
                              └──────────────────────────────────────┘
```

**Deployment shape today:** one Docker image containing the fat JAR (API + built frontend static assets), run by Elastic Beanstalk via a single-service Docker Compose file. The UI is not a separately deployed SPA in production.

## 2. Application architecture

### 2.1 Packaging model

- **Monolith / modular-monolith style:** frontend source lives under `src/frontend` but is compiled and copied into `target/classes/static` during Maven’s `build-frontend` profile (active by default).
- Spring Boot serves both JSON API and the Vite production build from one process.
- Local Vite dev mode is the exception: separate Node process with HTTP proxy to the API.

### 2.2 Backend layers

Package root: `com.example.demo`

| Layer | Types | Role |
| --- | --- | --- |
| Bootstrap | `DemoApplication` | Spring Boot entrypoint |
| API | `StudentController` | `@RestController` at `api/v1/students` |
| Domain / persistence model | `Student` (`@Entity`), `Gender` enum | JPA entity with Bean Validation (`@NotBlank`, `@Email`, `@NotNull`) |
| Application service | `StudentService` | List, add (email uniqueness), delete (existence check) |
| Persistence | `StudentRepository` (`JpaRepository`) | CRUD + JPQL `selectExistsEmail` |
| Errors | `BadRequestException` (400), `StudentNotFoundException` (404) | `@ResponseStatus` runtime exceptions |

**Request flow (create):**

1. `POST /api/v1/students` with JSON body → controller `@Valid` Student  
2. Service checks email via repository → `BadRequestException` if taken  
3. `save` via JPA  

**Gaps vs a full CRUD product (recorded, not fixed):** no update endpoint; no authn/authz; no DTO boundary (entity exposed over the wire); no global exception advice beyond `@ResponseStatus`; no Flyway/Liquibase (DDL via Hibernate `update`).

### 2.3 Frontend

| Concern | Implementation |
| --- | --- |
| Framework | React 18 + TypeScript function components + hooks (Vite 5) |
| UI kit | Ant Design 4 (Layout, Table, Drawer, Form, notifications) |
| HTTP | Typed `client` helpers against relative `api/v1/students` (`unfetch`) |
| Structure | `components/layout` (`AppLayout`) + `components/students` (`StudentsView`, drawer/table) + `useStudents` |
| Features | List students, add via drawer form, delete with confirm; empty-state CTA |
| Incomplete UX | Edit button rendered but not connected to any API |

Production: relative API URLs work because UI and API share origin. Dev: Vite `server.proxy` `/api` → `localhost:8080`.

### 2.4 Configuration profiles

| File | When used | Notable settings |
| --- | --- | --- |
| `application.properties` | Default / local / CI | Local Postgres JDBC defaults via `${SPRING_DATASOURCE_*:…}` placeholders; `ddl-auto=update`; SQL logging on; error messages included in responses |
| `application-dev.properties` | `SPRING_PROFILES_ACTIVE=dev` (EB compose) | Datasource **required** from env: `SPRING_DATASOURCE_URL` / `_USERNAME` / `_PASSWORD` (no secrets in git) |

Elastic Beanstalk compose sets `SPRING_PROFILES_ACTIVE: dev` and passes through `SPRING_DATASOURCE_*` from the host/EB environment.

## 3. Data model

**Student**

| Field | Constraints |
| --- | --- |
| `id` | Sequence-generated `Long` |
| `name` | Non-blank, non-null column |
| `email` | Valid email, unique, non-null |
| `gender` | Enum `MALE` \| `FEMALE` \| `OTHER`, stored as string |

## 4. Build & artifact pipeline

```text
src/frontend ──npm install/build──▶ src/frontend/build
                                         │
                    maven-resources-plugin │
                                         ▼
                                   target/classes/static
                                         │
                              spring-boot-maven-plugin
                                         ▼
                                   demo-*.jar
                                         │
                              Jib (optional profiles)
                                         ▼
                     Docker Hub: cariocaphil/spring-react-fullstack:{tag|latest}
```

Maven profiles:

| Profile | Default | Purpose |
| --- | --- | --- |
| `build-frontend` | **yes** | Install Node/npm via plugin, `npm install`, `npm test` (Vitest), `vite build`, copy to classpath static |
| `jib-push-to-dockerhub` | no | On `package`, Jib `build` → Docker Hub (`cariocaphil/spring-react-fullstack`) |
| `jib-push-to-local` | no | On `package`, Jib `dockerBuild` → local Docker |

Base image: `eclipse-temurin:17-jre`. Container exposes `8080`, OCI format.

## 5. CI/CD flow (as implemented)

### 5.1 PR / CI — `build.yml`

1. Trigger: `pull_request` → `main`, or `workflow_dispatch`
2. Service container: Postgres 13.1 (`cariocaphil` / `postgres` / `password`)
3. Java 17 (Temurin) via `actions/setup-java@v5`
4. `./mvnw clean package -P build-frontend`

(`actions/checkout@v4` is used for checkout. `deploy.yml` uses the same checkout / setup-java majors as of PR 4.)

### 5.2 Main / CICD — `deploy.yml`

Intended sequence:

1. Slack “CICD ongoing”
2. Checkout (`actions/checkout@v4`) + Java 17 Temurin (`actions/setup-java@v5`) + Postgres service
3. Compute build number timestamp `d.m.Y.H.M.S` via `$GITHUB_OUTPUT`
4. Docker Hub login (`DOCKER_HUB_USERNAME=cariocaphil` + secret password)
5. Maven package with `build-frontend` + `jib-push-to-dockerhub` and `-Dapp.image.tag=…`
6. Slack “pushed … to docker hub” for `cariocaphil/spring-react-fullstack` (Hub link aligned in PR 11)
7. `sed` rewrite of `cariocaphil/spring-react-fullstack` tag in `elasticbeanstalk/docker-compose.yml` for this job’s EB package only (fails if tag missing; **not** committed back to the repo as of PR 13)
8. `einaregilsson/beanstalk-deploy` with compose file as deployment package
9. Slack completion (EB URL in message)

**EB target names (from workflow env):**

- Application: `springboot-react-fullstack`
- Environment: `Springbootreactfullstack-env`
- Region env var: `eu-west-1`
- Deployment package: `elasticbeanstalk/docker-compose.yml`

### 5.3 Runtime on Elastic Beanstalk

`elasticbeanstalk/docker-compose.yml`:

- Single service `backend`
- Image tag currently pinned in-repo (example: `cariocaphil/spring-react-fullstack:40`)
- Port map `80:8080`
- `restart: always`
- Profile `dev` → datasource from `SPRING_DATASOURCE_*` environment variables (passed through compose)

## 6. Testing (current)

| Area | Present today |
| --- | --- |
| Backend | `DemoApplicationTests`; `StudentServiceTest` (Mockito); `StudentRepositoryTest` (`@DataJpaTest`); `StudentIntegrationTest` (MockMvc API) |
| Frontend | Vitest suite for client, apiError, notifications, drawer, avatar, and App flows; Maven `build-frontend` runs `npm test` before `vite build` |
| Integration / repository / service tests | Present for student create/list/delete and email uniqueness (PR 14) |

CI validates that the project **packages** against a live Postgres and runs the Vitest frontend suite during `build-frontend`.

## 7. Technical debt & inconsistencies (recorded, not remediated)

These items are intentional backlog for modernization; this branch does not fix them.

### Security & secrets

- ~~RDS credentials committed in `application-dev.properties`~~ — removed in PR 12; `dev` requires env vars
- ~~Rotate previously leaked RDS password~~ — done in AWS/EB (ops); old values may still exist in git history — optional history scrub if policy requires it
- Local/CI still use default `postgres`/`password` placeholders (acceptable for local only)
- No Spring Security / authentication / authorization
- API and error payloads expose binding/message details (`server.error.include-message=always`)

### Configuration & ops drift

- Deploy Slack Hub text aligned to `cariocaphil/spring-react-fullstack` in PR 11; final Slack URL remains `http://springbootreactfullstack-env.eba-qtwuxhgp.eu-central-1.elasticbeanstalk.com/`
- Compose image tag is pinned in the deploy job workspace for EB (PR 13); the checked-in compose file may lag the latest Hub tag until someone updates it deliberately

### Platform age

- Spring Boot **3.4.5** / Java **17** / `jakarta.*` (migrated in PR 16)
- React **18.3** + TypeScript / Ant Design **4.24** / Vite 5 / Node 20 via frontend-maven-plugin (React 18 in PR 20; React 19 deferred until Ant Design 5)
- Jib **3.5.2** with `eclipse-temurin:17-jre` (Java 17 runtime as of PR 15)

### Product / design

- Edit UI without backend update API
- Placeholder Ant Design sidebar/menu content unrelated to students
- Hibernate `ddl-auto=update` used for deployed `dev` profile (no migration history)
- Entity used as API contract
- Dual lockfiles and tutorial footer/marketing link in production UI

### Quality

- Minimal automated tests
- Unused imports in `StudentService` (HttpStatus / ResponseStatus)
- Manual getters/setters alongside Lombok annotations on `Student`

## 8. What “done” looks like for this baseline

Stakeholders can answer:

1. What runs where (local vs EB)?
2. How is the React app shipped?
3. How does a change on `main` become a running EB version?
4. Which debt is accepted for now vs queued for modernization?

Target architecture and phased work: [modernization-roadmap.md](modernization-roadmap.md).
