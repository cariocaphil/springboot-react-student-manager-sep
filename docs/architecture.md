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

**Deployment shape today:** one Docker image containing the fat JAR (API + built frontend static assets), run by Elastic Beanstalk (LoadBalanced, min=max 1) via a single-service Docker Compose file. Public traffic reaches the app at **https://sep.learning-projects.dev** (TLS at the ALB). The UI is not a separately deployed SPA in production.

## 2. Application architecture

### 2.1 Packaging model

- **Monolith / modular-monolith style:** frontend source lives under `src/frontend` but is compiled and copied into `target/classes/static` during Maven’s `build-frontend` profile (active by default).
- Spring Boot serves both JSON API and the Vite production build from one process.
- Local Vite dev mode is the exception: separate Node process with HTTP proxy to the API.

### 2.2 Backend layers

Package root: `com.example.demo`

Student feature packages under `com.example.demo.student`:

| Layer | Package | Types | Role |
| --- | --- | --- | --- |
| Bootstrap | `com.example.demo` | `DemoApplication` | Spring Boot entrypoint |
| Security | `com.example.demo.security` | `SecurityConfig`, `DatabaseUserDetailsService` | Stateless `SecurityFilterChain`; HTTP Basic; `/api/**` authenticated; `@EnableMethodSecurity` |
| User | `user.domain` / `user.persistence` / `user.application` / `user.api` | `AppUser`, `Role`, `AppUserRepository`, `AdminUserBootstrap`, `MeController`, `CurrentUserResponse` | DB-backed Basic-auth users (BCrypt + role); env bootstrap as `ADMIN`; `GET /api/v1/me` |
| API | `student.api` | `StudentController`, DTOs, `StudentMapper`, `StudentApiPaths`, `ApiExceptionHandler`, `ApiErrorCode`, `OpenApiConfig` | HTTP boundary + stable error JSON + OpenAPI |
| Domain | `student.domain` | `Student` (`@Entity`), `Gender` | Persistence model (not the frontend wire types) |
| Application | `student.application` | `StudentService` | List, add, update (email uniqueness excluding self), delete; class `@Transactional(readOnly = true)`, writes override with `@Transactional` |
| Persistence | `student.persistence` | `StudentRepository` | CRUD + derived `existsByEmail` |
| Exceptions | `student.exception` | `DuplicateEmailException`, `StudentNotFoundException`, `BadRequestException` (generic fallback) | Domain/API failure types |

**Request flow (create):**

1. `POST /api/v1/students` with JSON body → controller `@Valid StudentRequest`  
2. Map to `Student` entity → service checks email via repository → `DuplicateEmailException` if taken  
3. `save` via JPA → **201 Created** (empty body)

**Other success statuses:** `GET` → **200 OK**; `PUT` / `DELETE` → **204 No Content**.

**OpenAPI:** springdoc exposes `/v3/api-docs`. A normalized copy is committed at `api/openapi.json` and drift-checked by `OpenApiContractTest`. Schemas include `StudentRequest`, `StudentResponse`, `CurrentUserResponse`, and `ApiErrorResponse` (required `code` + diagnostic `message` + HTTP `status`/`error`). The JPA `Student` entity is not part of the published contract.

**Security (PR 39–43):** `SecurityConfig` configures a **stateless** API with **HTTP Basic**. `/api/**` requires authentication (`authenticated()`). Role checks use `@EnableMethodSecurity` + `@PreAuthorize` on `StudentController`: `ADMIN` and `USER` may `GET` students; only `ADMIN` may `POST`/`PUT`/`DELETE` (otherwise **403**). `/v3/api-docs` is public for contract tests and tooling. Packaged SPA/static assets remain public. CSRF is **disabled** because there are no cookie sessions or form-login flows (CSRF tokens do not apply to this Basic-auth REST shape). Form login / logout redirects are disabled so unauthenticated API calls receive **401** (not an HTML login page). Users are stored in PostgreSQL (`AppUser` / `app_user`) with **BCrypt** hashes and a single `Role` (`ADMIN` \| `USER`), loaded by `DatabaseUserDetailsService` as `ROLE_*` authorities. The first user is created on startup by `AdminUserBootstrap` from `APP_ADMIN_USERNAME` / `APP_ADMIN_PASSWORD` when that username is missing (create-if-absent as **`ADMIN`**; existing rows are not updated). Local/CI defaults are `dev` / `changeme` via `app.admin.*` in `application.properties`. Profile **`dev`** (Elastic Beanstalk) requires `APP_ADMIN_*` with no fallback in `application-dev.properties` (same fail-closed pattern as RDS). Obsolete `SECURITY_USER_*` / `spring.security.user.*` are removed.

**Current user (PR 44):** `GET /api/v1/me` (`MeController`) returns `CurrentUserResponse` (`username`, `role` as `ADMIN` \| `USER`) derived from the authenticated `UserDetails` principal (no second repository lookup). Covered by the existing `/api/**` authenticated rule.

**Frontend auth (PR 40 + 44):** The SPA shows a login screen; credentials live **in memory only** and are sent as `Authorization: Basic …` via the shared API client. Login probes `GET /api/v1/me`, stores `{ username, role }` in `AuthContext`, and exposes `canManageStudents` (`role === 'ADMIN'`). Students UI hides Add/Edit/Delete (and the student drawer) when `canManageStudents` is false. Hiding controls is UX only — backend `@PreAuthorize` remains the security boundary. Logout and mid-session **401** responses clear credentials/user and return to login. **JWT, session cookies, and OAuth/OIDC remain out of scope**.

**Student update (PR 45):** `PUT /api/v1/students/{studentId}` accepts `@Valid StudentRequest` (full replacement), returns **204**, and is ADMIN-only. Email uniqueness ignores the current row (`existsByEmailAndIdNot`). The SPA reuses `StudentDrawerForm` for create and edit; Edit opens the drawer prefilled and saves via `updateStudent` / TanStack mutation.

**Gaps vs a full CRUD product (recorded, not fixed):** no JWT/OAuth; no Flyway/Liquibase (DDL via Hibernate `update`).

### 2.3 Frontend

| Concern | Implementation |
| --- | --- |
| Framework | React 19 + TypeScript function components + hooks (Vite 5) |
| UI kit | Ant Design 5 (Layout, Table, Drawer, Form layout, notifications; CSS-in-JS) |
| i18n | `i18next` + `react-i18next`; default `en`, resources also for `de`; Ant Design `ConfigProvider` locale follows language; header `LanguageSwitcher` (EN/DE) |
| HTTP | Typed `client` helpers + `apiRoutes` (`studentsApi`, `meApi`) against relative `api/v1/…` (`unfetch`); in-memory Basic `Authorization` via `auth/authCredentials`; login via `getCurrentUser()`; TanStack Query (`useQuery` / `useMutation`) via `useStudents` |
| Forms | React Hook Form + Zod (`createStudentFormSchema` / `createLoginFormSchema` via `i18n.t`); declarative `studentFormFields` with `labelKey` / `placeholderKey` + `StudentFormField` (`useTranslation` at render); table columns via `useStudentColumns` |
| Errors | `apiError` maps known OpenAPI `ApiErrorCode` values to i18n (`errors.codes.*`); unknown codes / unexpected failures → generic i18n; `message` is diagnostic only for known codes; list load failures render in-page error + Retry; login invalid credentials → in-page alert |
| Wire types | Generated by `openapi-typescript` from `api/openapi.json` into `types/generated/schema.d.ts` (**do not edit**). `types/student` / `types/api` alias generated schemas for app use; UI-only types (e.g. form values, notifications) stay separate |
| Structure | `auth/` (Basic credentials + `AuthProvider`) + `components/login` + `components/layout` (shell) + `components/students` (view/table/drawer leaves) + `hooks/useStudents` |
| Features | Login gate, logout, list students (loading / empty / error+retry / table), add via drawer form, delete with confirm |
| Incomplete UX | Edit button rendered but not connected to any API |

```text
Spring Boot DTOs ──springdoc──▶ /v3/api-docs ──export──▶ api/openapi.json
                                                          │
                                                          ▼
                                              openapi-typescript
                                                          │
                                                          ▼
                                    types/generated/schema.d.ts  (committed)
                                                          │
                                                          ▼
                                    types/student + types/api aliases
                                                          │
                                                          ▼
                                              client.ts / hooks / UI
```

```text
App (QueryClientProvider + AuthProvider)
├── LoginPage (unauthenticated)
└── AppLayout (authenticated)
    └── StudentsView (students/)
        ├── useStudents → TanStack Query + client / apiRoutes / apiError / Notification
        ├── EmptyStudents | StudentsLoadError → ErrorState | StudentsTable (+ studentColumns, StudentActions, …)
        └── StudentDrawerForm (react-hook-form + Zod + studentFormFields + onCreate)
```

Production: relative API URLs work because UI and API share origin. Dev: Vite `server.proxy` `/api` → `localhost:8080`.

### 2.4 Configuration profiles

| File | When used | Notable settings |
| --- | --- | --- |
| `application.properties` | Default / local / CI | Local Postgres JDBC defaults via `${SPRING_DATASOURCE_*:…}` placeholders; AppUser bootstrap via `${APP_ADMIN_*:…}` (defaults `dev`/`changeme`); `ddl-auto=update`; SQL logging on; error messages included in responses |
| `application-dev.properties` | `SPRING_PROFILES_ACTIVE=dev` (EB compose) | Datasource and AppUser bootstrap **required** from env: `SPRING_DATASOURCE_*`, `APP_ADMIN_*` (no secrets in git) |

Elastic Beanstalk compose sets `SPRING_PROFILES_ACTIVE: dev` and passes through `SPRING_DATASOURCE_*` and `APP_ADMIN_*` from the host/EB environment.

## 3. Data model

**Student**

| Field | Constraints |
| --- | --- |
| `id` | Sequence-generated `Long` |
| `name` | Non-blank, non-null column |
| `email` | Valid email, unique, non-null |
| `gender` | Enum `MALE` \| `FEMALE` \| `OTHER`, stored as string |

**AppUser** (table `app_user`)

| Field | Constraints |
| --- | --- |
| `id` | Sequence-generated `Long` |
| `username` | Unique, non-null |
| `password_hash` | Non-null BCrypt hash (never plaintext) |
| `role` | Enum `ADMIN` \| `USER` (string); non-null; SQL default `ADMIN` for existing rows |

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
| `build-frontend` | **yes** | Install Node/npm via plugin, `npm install`, `npm run format:check`, `npm run check:api-types`, `npm run lint`, `npm run test:coverage` (Vitest + V8), `vite build`, copy to classpath static |
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
9. Slack completion (public HTTPS app URL)

**EB target names (from workflow env):**

- Application: `springboot-react-fullstack`
- Environment: `springboot-react-fullstack-env`
- Region: `eu-central-1` (all regional SEP infrastructure; Route 53 DNS is global)
- Deployment package: `elasticbeanstalk/docker-compose.yml`
- Public URL: `https://sep.learning-projects.dev`

### 5.3 Runtime on Elastic Beanstalk

Environment type: **LoadBalanced** (ALB). Auto Scaling is intentionally **min = 1 / max = 1** — the load balancer is used for HTTPS/TLS, not horizontal scaling.

`elasticbeanstalk/docker-compose.yml`:

- Single service `backend`
- Image tag currently pinned in-repo (example: `cariocaphil/spring-react-fullstack:40`)
- Port map `80:8080` (container still serves HTTP on 8080; the ALB terminates TLS in front)
- `restart: always`
- Profile `dev` → datasource and AppUser bootstrap from `SPRING_DATASOURCE_*` / `APP_ADMIN_*` (passed through compose)

### 5.4 Production HTTPS / TLS

Public hostname: **https://sep.learning-projects.dev** (`learning-projects.dev` hosted in Route 53).

```text
Client
  │
  │  HTTP :80
  v
Application Load Balancer ──301 redirect (preserve host/path/query)──▶ HTTPS :443
  │
  │  TLS terminated (ACM cert for sep.learning-projects.dev)
  v
Application Load Balancer
  │
  │  HTTP (internal)
  v
Elastic Beanstalk instance / SEP container (:8080)
```

| Component | Role |
| --- | --- |
| Route 53 | DNS for `learning-projects.dev`; `sep.learning-projects.dev` A/alias to the EB environment; retains ACM DNS-validation CNAMEs for certificate renewal |
| ACM | Public TLS certificate for `sep.learning-projects.dev` (DNS validation via Route 53), issued in **eu-central-1** |
| Application Load Balancer | HTTPS :443 with the ACM cert; HTTP :80 → permanent 301 to HTTPS; TLS ends here — not in Spring Boot |
| Elastic Beanstalk / app | Runs the Dockerized Spring Boot process over HTTP behind the ALB (`80:8080` in compose) |

HTTPS matters especially because the app uses **HTTP Basic Authentication**, so reusable credentials travel with authenticated requests. The HTTP→HTTPS redirect is configured on the **ALB listener**, not in Spring Boot.

#### What HTTPS protects for Basic Auth

Authenticated requests send credentials in the HTTP header:

```http
Authorization: Basic <base64(username:password)>
```

Base64 is **encoding, not encryption** — anyone who obtains that value can decode it back to the username and password. HTTPS/TLS does **not** remove or hide the `Authorization` header from the browser or the application: DevTools can still show it (the browser builds the request), and Spring Boot must receive it to authenticate.

What TLS **does** protect is transmission over the **public** network: headers and body are encrypted inside the TLS connection between the client and the ALB. A network observer should not be able to read Basic Auth credentials from intercepted HTTPS traffic.

```text
Browser
  |
  | Authorization: Basic ...
  | [HTTP request encrypted by TLS]
  v
Application Load Balancer   ← TLS terminates here
  |
  | HTTP (VPC-internal) + Authorization header
  v
Spring Boot / SEP container
```

**Precise rationale:** HTTPS protects reusable Basic Auth credentials **in transit over the public network**; it does not make them invisible to the client or server. After TLS termination, ALB→app remains HTTP inside the VPC (that path is trusted, not end-to-end encrypted to the JVM). This is one reason Basic Auth must not be used over unencrypted public HTTP.

## 6. Testing (current)

| Area | Present today |
| --- | --- |
| Backend | `DemoApplicationTests`; `StudentServiceTest` (Mockito); `StudentRepositoryTest` (`@DataJpaTest`); `StudentIntegrationTest` (MockMvc API + Basic auth as ADMIN); `SecurityIntegrationTest` (401 / authenticated / public OpenAPI); `AuthorizationIntegrationTest` (USER/ADMIN matrix); `MeIntegrationTest` (`GET /api/v1/me`); `OpenApiContractTest`; JaCoCo report on `test` |
| Frontend | Vitest for `client`, `apiRoutes`, `apiError`, auth/`/me` login, role-aware students UI, notifications, `useStudents`, student/layout leaves, drawer, and App flows; ESLint + Prettier; Maven `build-frontend` runs `format:check`, `check:api-types`, `lint`, and `npm run test:coverage` before `vite build` |
| OpenAPI | `OpenApiContractTest` asserts committed `api/openapi.json` matches `/v3/api-docs`; frontend `check:api-types` asserts generated TS matches that JSON |
| Integration / repository / service tests | Present for student create/list/delete and email uniqueness (PR 14) |
| Coverage | CI uploads JaCoCo XML + Vitest Cobertura to Codecov; `codecov.yml` enforces 80% project and patch (PR 38) |

CI validates that the project **packages** against a live Postgres and runs frontend format check, OpenAPI type drift check, ESLint, and the Vitest suite (with coverage) during `build-frontend`, then uploads coverage to Codecov.

## 7. Technical debt & inconsistencies (recorded, not remediated)

These items are intentional backlog for modernization; this branch does not fix them.

### Security & secrets

- ~~RDS credentials committed in `application-dev.properties`~~ — removed in PR 12; `dev` requires env vars
- ~~Rotate previously leaked RDS password~~ — done in AWS/EB (ops); old values may still exist in git history — optional history scrub if policy requires it
- Local/CI still use default `postgres`/`password` placeholders (acceptable for local only)
- ~~No Spring Security~~ — PR 39 adds HTTP Basic + `/api/**` protection; still no JWT/OAuth
- ~~SPA had no login~~ — PR 40 adds in-memory Basic login/logout; still no JWT/session persistence (refresh requires re-login)
- ~~In-memory Spring Security user (`SECURITY_USER_*`)~~ — PR 42 moves users to PostgreSQL (`AppUser` + BCrypt); bootstrap via `APP_ADMIN_*`
- ~~No roles beyond `authenticated()`~~ — PR 43 adds `ADMIN`/`USER` + `@PreAuthorize` on student endpoints
- ~~SPA showed write controls to `USER`~~ — PR 44 probes `/me` and hides Add/Delete for non-admins (backend still authoritative)
- Basic defaults (`dev`/`changeme`) apply only when profile `dev` is **not** active; EB `dev` profile requires `APP_ADMIN_*` (no fallback); bootstrap user is `ADMIN`
- After deploying PR 42+, remove obsolete `SECURITY_USER_*` from the EB environment and set `APP_ADMIN_*` once so the first admin row is created
- API and error payloads expose binding/message details (`server.error.include-message=always`)

### Configuration & ops drift

- ~~Deploy Slack completion still pointed at HTTP `*.elasticbeanstalk.com`~~ — updated in PR 41 to `https://sep.learning-projects.dev/`
- Compose image tag is pinned in the deploy job workspace for EB (PR 13); the checked-in compose file may lag the latest Hub tag until someone updates it deliberately

### Platform age

- Spring Boot **3.4.5** / Java **17** / `jakarta.*` (migrated in PR 16)
- React **19.3** + TypeScript / Ant Design **5.29** / i18next (en/de) / Vite 5 / Node 20 via frontend-maven-plugin (`@ant-design/v5-patch-for-react-19` for static APIs; React 19 in PR 30; i18n in PR 31)
- Jib **3.5.2** with `eclipse-temurin:17-jre` (Java 17 runtime as of PR 15)

### Product / design

- Edit UI without backend update API
- Hibernate `ddl-auto=update` used for deployed `dev` profile (no migration history)

### Quality

- Frontend Vitest coverage expanded in PRs 18–21; backend service/repo/API tests from PR 14 — still no broad E2E
- Codecov reports overall coverage (PR 38); some frontend entry/boot files remain uncovered (`index.tsx`, `reportWebVitals`) without failing the 80% gates
- Unused imports in `StudentService` (HttpStatus / ResponseStatus)

## 8. What “done” looks like for this baseline

Stakeholders can answer:

1. What runs where (local vs EB)?
2. How is the React app shipped?
3. How does a change on `main` become a running EB version?
4. Which debt is accepted for now vs queued for modernization?

Target architecture and phased work: [modernization-roadmap.md](modernization-roadmap.md).
