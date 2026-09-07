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
- Spring Boot serves both JSON API and the CRA production build from one process.
- Local CRA dev mode is the exception: separate Node process with HTTP proxy to the API.

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
| Framework | React 17 function components + hooks |
| UI kit | Ant Design 4 (Layout, Table, Drawer, Form, notifications) |
| HTTP | `unfetch` wrappers in `client.js` against relative `api/v1/students` |
| Features | List students, add via drawer form, delete with confirm; empty-state CTA |
| Incomplete UX | Edit button rendered but not connected to any API |

Production: relative API URLs work because UI and API share origin. Dev: CRA `proxy` → `localhost:8080`.

### 2.4 Configuration profiles

| File | When used | Notable settings |
| --- | --- | --- |
| `application.properties` | Default / local | Local Postgres JDBC; `ddl-auto=update`; SQL logging on; error messages included in responses |
| `application-dev.properties` | `SPRING_PROFILES_ACTIVE=dev` (EB compose) | AWS RDS JDBC URL; hardcoded DB username/password in source |

Elastic Beanstalk compose sets `SPRING_PROFILES_ACTIVE: dev` for the backend service.

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
| `build-frontend` | **yes** | Install Node/npm via plugin, `npm install`, `npm run build`, copy to classpath static |
| `jib-push-to-dockerhub` | no | On `package`, Jib `build` → Docker Hub (`cariocaphil/spring-react-fullstack`) |
| `jib-push-to-local` | no | On `package`, Jib `dockerBuild` → local Docker |

Base image: `openjdk:11`. Container exposes `8080`, OCI format.

## 5. CI/CD flow (as implemented)

### 5.1 PR / CI — `build.yml`

1. Trigger: `pull_request` → `main`, or `workflow_dispatch`
2. Service container: Postgres 13.1 (`cariocaphil` / `postgres` / `password`)
3. Java 11 via `actions/setup-java@v1.4.3`
4. `./mvnw clean package -P build-frontend`

### 5.2 Main / CICD — `deploy.yml`

Intended sequence:

1. Slack “CICD ongoing”
2. Checkout + Java 11 + Postgres service
3. Compute build number timestamp `d.m.Y.H.M.S`
4. Docker Hub login (`DOCKER_HUB_USERNAME=cariocaphil` + secret password)
5. Maven package with `build-frontend` + `jib-push-to-dockerhub` and `-Dapp.image.tag=…`
6. Slack “pushed … to docker hub” (message text still references historical `amigoscode/…` image names)
7. `sed` rewrite of image tag inside `elasticbeanstalk/docker-compose.yml`, commit, push as `github-actions`
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
- Profile `dev` → RDS-backed config

## 6. Testing (current)

| Area | Present today |
| --- | --- |
| Backend | `DemoApplicationTests` — `@SpringBootTest` context load only |
| Frontend | CRA scaffold `App.test.js` (not part of Maven CI package step beyond whatever CRA may run locally) |
| Integration / repository / service tests | **Not present** in the tracked tree |

CI validates that the project **packages** against a live Postgres; it does not exercise a rich automated test suite.

## 7. Technical debt & inconsistencies (recorded, not remediated)

These items are intentional backlog for modernization; this branch does not fix them.

### Security & secrets

- RDS hostname, username, and password committed in `application-dev.properties`
- Local DB password in plaintext properties
- No Spring Security / authentication / authorization
- API and error payloads expose binding/message details (`server.error.include-message=always`)

### Configuration & ops drift

- Workflow `AWS_REGION=eu-west-1` vs Slack EB URL and RDS endpoint using **`eu-central-1`**
- Deploy Slack / `sed` patterns still mention **`amigoscode/springboot-react-fullstack`**, while Jib and compose use **`cariocaphil/spring-react-fullstack`** — tag bump / messaging may not match reality
- `deploy.yml` begins with a literal `YAML` token above `name:` (invalid / fragile workflow document shape)
- Deprecated Actions patterns: `actions/checkout@v2`, `setup-java@v1`, `::set-output`
- CICD commits back to the repo from the runner (image tag churn on `main`)

### Platform age

- Spring Boot 2.5.x / Java 11 / javax namespace (EOL-era stack)
- CRA 4 / React 17 / Ant Design 4 / Node 15 via frontend-maven-plugin
- Jib 2.5.2; `openjdk:11` base (legacy tag practices)
- Both `package-lock.json` and `yarn.lock` under `src/frontend`
- Plugin config lists a stale top-level `nodeVersion` (`v4.6.0`) while the install execution uses `v15.4.0`

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
