# Frontend (Vite + TypeScript)

React 19 + TypeScript + Ant Design 5 UI for the student manager, with i18next (English default, German resources). Production builds land in `build/` and Maven copies them into the Spring Boot JAR (`target/classes/static`).

## Scripts

```bash
npm install
npm start         # Vite dev server on :3000 (proxies /api → :8080)
npm test          # Vitest once
npm run typecheck # tsc --noEmit
npm run build     # typecheck + production bundle → build/
```

See the root [README](../../README.md) for full-stack local run and packaging.
