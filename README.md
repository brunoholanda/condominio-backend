# Backend — CondoGest API

API REST multi-tenant em NestJS: condomínios, moradores, financeiro, áreas comuns,
documentos e contatos úteis.

## Executando

```bash
cp .env.example .env
npm install
npm run migration:run
npm run seed
npm run start:dev
```

API: `http://localhost:3333/api` · Swagger (não-prod): `http://localhost:3333/api/docs`

## Autenticação

Todas as rotas exigem JWT, salvo as marcadas com `@Public()`.

| Método | Rota | Acesso |
| ------ | ---- | ------ |
| `POST` | `/api/auth/register` | público — cria conta |
| `POST` | `/api/auth/login` | público — credenciais + OTP por e-mail |
| `POST` | `/api/auth/login/confirm` | público — código → JWT |
| `POST` | `/api/auth/login/resend` | público |
| `GET` | `/api/auth/me` | autenticado |
| `PUT` | `/api/auth/me/cpf` | autenticado |

Login continua em duas etapas (senha + código de 6 dígitos por SMTP).

## Multi-tenant

| Prefixo | Uso |
| ------- | --- |
| `/api/condominiums` | CRUD dos condomínios do usuário |
| `/api/condominiums/:id/...` | Gestão (membership + papéis OWNER/MANAGER/OPERATOR) |
| `/api/c/:slug/...` | Público (perfil, units, cadastro, docs, contatos, áreas) e reservas do morador |

Papéis: `OWNER` (tudo), `MANAGER` (operacional), `OPERATOR` (só moradores).

## Módulos sob `/condominiums/:id`

- `residents` — lista, summary, PDF, update, delete
- `payables` (+ `attachments`) — contas a pagar e arquivos
- `common-areas`, `bookings`, `resident-accounts` — áreas e reservas
- `documents` — comunicados / atas / avisos
- `contacts` — telefones úteis (linktree)

Arquivos anexados ficam no **Cloudflare R2** (`R2_*` no `.env`), organizados por
condomínio (`condominiums/{id}/payables/...`).

## Seed

`npm run seed` cria/atualiza `SEED_ACCOUNTS` e garante o condomínio demo **Porto Imperial**
(`porto-imperial`).

Papéis aplicados **por e-mail** (não pela ordem do JSON):

| E-mail | Plataforma | Plano | Demo condo |
| ------ | ---------- | ----- | ---------- |
| `holanda_rodrigues@hotmail.com` | **SYSTEM_OWNER** (dono/gestor do sistema) | Gestor ACTIVE | OWNER |
| `hellennamello@hotmail.com` | sem SYSTEM_OWNER | **Prime ACTIVE** | OWNER |
| demais contas em `SEED_ACCOUNTS` | sem SYSTEM_OWNER | Lite | OPERATOR |

Reexecutar o seed é seguro: atualiza senha, plano, remove SYSTEM_OWNER indevido da Hellen e
reaplica os vínculos.

## Scripts

| Comando | Descrição |
| ------- | --------- |
| `npm run start:dev` | Watch mode |
| `npm run build` | Compila |
| `npm test` | Jest (domínio) |
| `npm run lint` | ESLint + Prettier |
| `npm run migration:run` | Aplica migrations |
| `npm run seed` | Contas + demo condo |

## Estrutura

```
src/
├── config/
├── database/          migrations + seed
├── shared/            erros, VOs, mail, storage, filtros HTTP
└── modules/
    ├── auth/
    ├── condominiums/
    ├── residents/
    ├── finance/
    ├── common-areas/
    ├── documents/
    └── directory/
```

Arquitetura hexagonal por módulo: `domain` → `application` → `infrastructure` / `presentation`.
