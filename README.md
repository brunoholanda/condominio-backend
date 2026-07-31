# Backend — API de Cadastro de Moradores

API REST em NestJS que recebe o formulário de cadastro de moradores e o persiste em PostgreSQL.

## Executando

```bash
cp .env.example .env
npm install
npm run migration:run
npm run seed
npm run start:dev
```

A API sobe em `http://localhost:3333/api` e o Swagger em `http://localhost:3333/api/docs`.
O PostgreSQL de desenvolvimento vem do `docker-compose.yml` na raiz do repositório.

## Autenticação

Por padrão **todas** as rotas exigem um JWT (`Authorization: Bearer <token>`). As únicas
exceções públicas são `POST /api/auth/login` e `POST /api/residents` (o formulário preenchido
pelo morador).

| Método | Rota               | Acesso      | Descrição                              |
| ------ | ------------------ | ----------- | -------------------------------------- |
| `POST` | `/api/auth/login`  | público     | Autentica e devolve o token             |
| `GET`  | `/api/auth/me`     | autenticado | Devolve o usuário da sessão             |
| `POST` | `/api/residents`   | público     | Cadastro preenchido pelo morador        |
| demais | `/api/residents/*` | autenticado | Consulta e gestão dos cadastros         |

A conta padrão é criada/atualizada por `npm run seed` a partir das variáveis `SEED_ADMIN_*`
do `.env` (e-mail `holanda_rodrigues@hotmail.com`). A senha só é gravada como hash bcrypt.

## Scripts

| Comando                     | Descrição                                     |
| --------------------------- | --------------------------------------------- |
| `npm run start:dev`         | Sobe a API em watch mode                      |
| `npm run build`             | Compila para `dist/`                          |
| `npm test`                  | Executa os testes de domínio (Jest)           |
| `npm run lint`              | ESLint + Prettier                             |
| `npm run migration:run`     | Aplica as migrations pendentes                |
| `npm run migration:revert`  | Desfaz a última migration                     |
| `npm run seed`              | Cria/atualiza a conta administradora padrão   |
| `npm run migration:generate -- src/database/migrations/NomeDaMigration` | Gera uma migration a partir das entidades |

## Estrutura

```
src/
├── config/                        Validação das variáveis de ambiente
├── database/                      DataSource, migrations e opções do TypeORM
├── shared/
│   ├── domain/                    Erros de domínio, guards e value objects reutilizáveis
│   ├── application/               Paginação, formatação de datas e validators de DTO
│   └── infrastructure/http/       Filtro que traduz erros de domínio em status HTTP
└── modules/residents/
    ├── domain/                    Agregado Resident, entidades filhas, enums e a porta do repositório
    ├── application/               Casos de uso, DTOs e presenter
    ├── infrastructure/persistence/ Entidades TypeORM, mapper e o adapter do repositório
    └── presentation/              Controller REST
```

O fluxo de uma requisição é sempre o mesmo:

```
Controller → Use case → ResidentRepository (porta) → TypeormResidentRepository (adapter) → PostgreSQL
```

O domínio fica no centro e não importa nada de HTTP ou do ORM, o que permite testar as regras sem
subir a aplicação (veja `resident.spec.ts`).

## Variáveis de ambiente

Todas são validadas na inicialização (`src/config/environment.ts`); a aplicação não sobe com uma
configuração inválida.

| Variável            | Padrão                  | Descrição                          |
| ------------------- | ----------------------- | ---------------------------------- |
| `NODE_ENV`          | `development`           | Ambiente de execução               |
| `PORT`              | `3333`                  | Porta HTTP                         |
| `API_PREFIX`        | `api`                   | Prefixo global das rotas           |
| `CORS_ORIGINS`      | `http://localhost:5173` | Origens permitidas (separadas por vírgula) |
| `DATABASE_HOST`     | —                       | Host do PostgreSQL                 |
| `DATABASE_PORT`     | `5432`                  | Porta do PostgreSQL                |
| `DATABASE_USER`     | —                       | Usuário                            |
| `DATABASE_PASSWORD` | —                       | Senha                              |
| `DATABASE_NAME`     | —                       | Nome do banco                      |
| `DATABASE_SSL`      | `false`                 | Habilita SSL na conexão            |
| `DATABASE_LOGGING`  | `false`                 | Loga as queries do TypeORM         |
| `JWT_SECRET`        | —                       | Segredo do JWT (mín. 32 caracteres)|
| `JWT_EXPIRES_IN_SECONDS` | `28800`            | Validade do token (8h por padrão)  |
| `SEED_ADMIN_NAME`   | `Administrador`         | Nome da conta criada pelo seed     |
| `SEED_ADMIN_EMAIL`  | —                       | E-mail da conta do seed            |
| `SEED_ADMIN_PASSWORD` | —                     | Senha em texto puro (só no seed)   |

## Modelo de dados

`residents` é a tabela raiz; `resident_household_members`, `resident_employees`,
`resident_vehicles` e `resident_pets` referenciam o morador com `ON DELETE CASCADE`. O CPF tem
índice único e o banco reforça, por _check constraint_, que todo inquilino tenha
proprietário/administradora preenchido.

O schema é versionado por migrations — `synchronize` está desabilitado em todos os ambientes.
