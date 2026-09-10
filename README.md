# Spring Boot + React Student Manager

Full-stack student CRUD demo: a Spring Boot API and a Vite React UI packaged into a single deployable JAR/container and published to AWS Elastic Beanstalk.

## Status

**Modernization:** PR 32 mounts the EN/DE language switcher in the layout header. Future work continues from PR 32.

| | |
| --- | --- |
| Current | **Java 17** / Spring Boot **3.4.5**; Vite + TypeScript **React 19.3** with **Ant Design 5**, **i18next** (en/de) + header language switcher, **TanStack Query**, **React Hook Form**, **Zod**, config-driven drawer fields, **ESLint** + **Prettier**; POST **201** / DELETE **204** |
| Next | Further platform work per roadmap |
| Full checklist | [docs/modernization-roadmap.md](docs/modernization-roadmap.md) |
| Architecture | [docs/architecture.md](docs/architecture.md) |

## Current stack (as-is)

| Layer | Technology |
| --- | --- |
| Backend | Java **17**, Spring Boot **3.4.5**, Spring Web, Spring Data JPA, Bean Validation, Lombok |
| Database | PostgreSQL (local `localhost:5432`; AWS RDS via `dev` profile) |
| Frontend | React **19.3** + **TypeScript**, **Vite 5**, Ant Design **5.29**, **i18next** / **react-i18next** (en/de), **TanStack Query 5**, **React Hook Form 7**, **Zod**, `unfetch`, Vitest, **ESLint 9**, **Prettier** |
| Build | Maven Wrapper, `frontend-maven-plugin` (Node **20** / npm **10**), Jib **3.5.2** |
| Container | Eclipse Temurin **17** JRE base (`eclipse-temurin:17-jre`); image name `cariocaphil/spring-react-fullstack` |
| CI/CD | GitHub Actions (`.github/workflows/build.yml`, `deploy.yml`) |
| Deploy | AWS Elastic Beanstalk (Docker Compose single-service app) |

## Repository layout

```
.
├── .github/workflows/     # CI (PR) and CICD (main → Docker Hub → Elastic Beanstalk)
├── elasticbeanstalk/      # docker-compose.yml deployed to EB
├── docs/                  # Architecture baseline and modernization roadmap
├── src/main/java/         # Spring Boot API (student domain)
├── src/main/resources/    # application.properties (+ application-dev.properties)
├── src/frontend/          # Vite + TypeScript React app (built into JAR static resources)
└── pom.xml                # Maven build, frontend packaging, Jib profiles
```

## Local development

### Prerequisites

- JDK 17+
- Maven Wrapper (`./mvnw`; no global Maven required)
- PostgreSQL 13.x listening on `localhost:5432`
- Node/npm only if you run the frontend separately (Maven installs Node during a full build)

### Database

Create a local database matching the **defaults** in `application.properties` (overridable via `SPRING_DATASOURCE_*`):

- Host/port: `localhost:5432`
- Database: `cariocaphil`
- User: `postgres`
- Password: `password`

Schema is managed by Hibernate (`spring.jpa.hibernate.ddl-auto=update` for the app; tests use `create-drop`).

**Start Postgres with Podman** (preferred on this machine) or Docker — same settings as CI:

```bash
podman run -d --name student-pg \
  -e POSTGRES_DB=cariocaphil \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:13.1
```

(Use `docker run …` instead of `podman run …` if you use Docker.)

**Connect and run a query:**

```bash
podman exec -it student-pg psql -U postgres -d cariocaphil
```

```sql
\dt
SELECT id, name, email, gender FROM student;
```

Stop/remove the container when finished: `podman stop student-pg && podman rm student-pg`.

For the `dev` profile (Elastic Beanstalk), set these in the environment (EB console / host) — **not** in git:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

### Backend + packaged frontend (single process)

From the repo root:

```bash
./mvnw spring-boot:run
```

Or build everything (frontend `npm install` / `npm run build`, copy into `target/classes/static`, package JAR):

```bash
./mvnw clean package -P build-frontend
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

The API listens on **http://localhost:8080**. In production-style packaging, the React build is served as static content from the same origin.

### Frontend in watch mode (optional)

```bash
cd src/frontend
npm install
npm start
```

Vite runs on **http://localhost:3000** and proxies `/api` to `http://localhost:8080` (`server.proxy` in `vite.config.js`).

### Local Docker image (optional)

```bash
./mvnw clean package -P build-frontend -P jib-push-to-local -Dapp.image.tag=local
```

Requires Docker. Pushes tags `cariocaphil/spring-react-fullstack:local` and `:latest` to the local daemon.

### Tests

```bash
./mvnw test
```

Runs `StudentServiceTest` (no DB), plus Postgres-backed `StudentRepositoryTest`, `StudentIntegrationTest`, and `DemoApplicationTests`. Start local Postgres first (see [Database](#database)). CI starts Postgres 13.1 before `./mvnw clean package`.

Frontend Vitest / lint / format (also run by Maven’s `build-frontend` profile before `vite build`):

```bash
cd src/frontend && npm test
cd src/frontend && npm run lint
cd src/frontend && npm run format:check
```

Covers API client helpers, notification wrappers, create-student drawer (validation / success / error), and App list/delete/empty flows. Use `npm run format` to apply Prettier.

## API surface (current)

Base path: `/api/v1/students`

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/api/v1/students` | List all students |
| `POST` | `/api/v1/students` | Create student (validated; rejects duplicate email) |
| `DELETE` | `/api/v1/students/{studentId}` | Delete by id (404 if missing) |

There is **no** update/PUT endpoint. The UI shows an Edit control that is not wired to the API.

## CI/CD overview

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| [`.github/workflows/build.yml`](.github/workflows/build.yml) (`CI`) | PRs to `main`, manual | Checkout, Java 17, Postgres 13.1 service, `./mvnw clean package -P build-frontend` |
| [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (`CICD`) | Push to `main`, manual | Build + Jib push to Docker Hub, pin compose image tag **in the job** (no commit-back), deploy that compose file to Elastic Beanstalk; Slack notifications |

Required secrets (documented as expected by the workflows; not inventing values): `DOCKER_HUB_PASSWORD`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SLACK_WEBHOOK_URL`.

## AWS Elastic Beanstalk (current)

- Application: `springboot-react-fullstack`
- Environment: `springboot-react-fullstack-env`
- Region: `eu-central-1`
- Package: `elasticbeanstalk/docker-compose.yml` (maps host `80` → container `8080`, sets `SPRING_PROFILES_ACTIVE=dev`, passes through `SPRING_DATASOURCE_*`)
- Runtime DB for `dev`: configure `SPRING_DATASOURCE_URL` / `_USERNAME` / `_PASSWORD` on the EB environment (compose does not embed secrets)

## Documentation

- [Architecture (current state + debt)](docs/architecture.md)
- [Modernization roadmap (PR build history)](docs/modernization-roadmap.md)
- [AGENTS.md](AGENTS.md) — shared coding-agent guidance
- [CLAUDE.md](CLAUDE.md) — Claude-specific entrypoint (defers to AGENTS.md)

## License / origin

Tutorial-style fullstack sample (Amigoscode footer/links in the UI). Do not commit database passwords; configure `dev` via environment variables.
