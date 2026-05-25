# Deploy Vercel + Neon

Este monorepo deve ser publicado como dois projetos separados na Vercel:

- `apps/api`: projeto backend NestJS.
- `apps/web`: projeto frontend Nuxt.

A Vercel detecta NestJS por entrypoint como `src/main.ts` e executa o app como uma unica Vercel Function. O backend usa `process.env.PORT` em producao e `3001` como fallback local.

## 1. Neon

1. No projeto do Neon, copie a connection string pooled ou direct do banco.
2. Use a URL no formato `postgresql://...?...sslmode=require`.
3. No backend, configure `DATABASE_SSL=true`.

## 2. Projeto backend na Vercel

Crie um projeto Vercel apontando para o mesmo repositorio, com:

- Root Directory: `apps/api`
- Framework Preset: `NestJS`
- Install Command: default
- Build Command: default ou `npm run build`

Configure as env vars do projeto backend:

```txt
NODE_ENV=production
CORS_ORIGIN=https://your-web-project.vercel.app
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
DATABASE_SSL=true
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1h
PASSWORD_SALT_ROUNDS=12
```

Depois de configurar `DATABASE_URL`, rode as migrations localmente apontando para o Neon:

```powershell
cd apps/api
npm install
npm run migration:run
npm run build
vercel --prod
```

## 3. Projeto frontend na Vercel

Crie outro projeto Vercel apontando para o mesmo repositorio, com:

- Root Directory: `apps/web`
- Framework Preset: `Nuxt`
- Install Command: default
- Build Command: default ou `npm run build`

Configure a env var do projeto frontend:

```txt
NUXT_PUBLIC_API_BASE_URL=https://your-api-project.vercel.app
```

Depois que o deploy do frontend existir, volte no projeto backend e ajuste `CORS_ORIGIN` para a URL final do frontend.

Comandos locais sugeridos antes do deploy:

```powershell
cd apps/web
npm install
npm run build
vercel --prod
```

## 4. Ordem recomendada

1. Configure e faca deploy do backend.
2. Rode `apps/api` migrations contra o Neon.
3. Configure e faca deploy do frontend usando a URL do backend.
4. Atualize `CORS_ORIGIN` no backend com a URL final do frontend.
5. Redeploy do backend para aplicar o CORS definitivo.

## 5. Validacao local

Backend:

```powershell
cd apps/api
npm run format:check
npm run lint
npm run build
npm run test
```

Frontend:

```powershell
cd apps/web
npm run format:check
npm run lint
npx tsc --noEmit
npm run build
```
