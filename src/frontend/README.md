# Frontend (Vite)

React 17 + Ant Design 4 UI for the student manager. Production builds land in `build/` and Maven copies them into the Spring Boot JAR (`target/classes/static`).

## Scripts

```bash
npm install
npm start      # Vite dev server on :3000 (proxies /api → :8080)
npm test       # Vitest once
npm run build  # production bundle → build/
```

See the root [README](../../README.md) for full-stack local run and packaging.
