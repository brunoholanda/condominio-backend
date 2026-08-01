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

A API sobe em `http://localhost:3333/api` e o Swagger em `http://localhost:3333/api/docs` — este
último só fora de produção, porque descreve rotas com dados pessoais e permite executá-las.
O PostgreSQL de desenvolvimento vem do `docker-compose.yml` na raiz do repositório.

## Autenticação

Por padrão **todas** as rotas exigem um JWT (`Authorization: Bearer <token>`). As exceções públicas
são as três etapas do login e `POST /api/residents` (o formulário preenchido pelo morador).

| Método | Rota                      | Acesso      | Descrição                                    |
| ------ | ------------------------- | ----------- | -------------------------------------------- |
| `POST` | `/api/auth/login`         | público     | Confere as credenciais e envia o código      |
| `POST` | `/api/auth/login/confirm` | público     | Confirma o código e devolve o token          |
| `POST` | `/api/auth/login/resend`  | público     | Reenvia o código da tentativa em andamento   |
| `GET`  | `/api/auth/me`            | autenticado | Devolve o usuário da sessão                  |
| `PUT`  | `/api/auth/me/cpf`        | autenticado | Registra o CPF de responsabilidade           |
| `POST` | `/api/residents`          | público     | Cadastro preenchido pelo morador             |
| demais | `/api/residents/*`        | autenticado | Consulta e gestão dos cadastros              |

As contas vêm de `SEED_ACCOUNTS` no `.env` e são criadas/atualizadas por `npm run seed`. Todas têm o
mesmo acesso; para liberar mais alguém, acrescente um objeto à lista e rode o seed de novo. As senhas
ficam no banco só como hash bcrypt. O `.env.example` traz apenas um exemplo fictício: e-mails e
senhas reais ficam no `.env`, que não é versionado.

### Confirmação em duas etapas

A senha sozinha não abre a área restrita. `POST /auth/login` valida as credenciais e responde apenas
com um `challengeId`, o e-mail parcialmente oculto e o prazo; o código de seis dígitos vai por e-mail
(SMTP configurado em `SMTP_*` e `MAIL_FROM`). O token só nasce em `POST /auth/login/confirm`.

O desafio fica em `login_challenges` e guarda **o hash** do código, como a senha: um vazamento do
banco não permite concluir logins. Ele vale `LOGIN_CODE_TTL_SECONDS` (10 minutos por padrão), aceita
até 5 tentativas e 3 reenvios, e serve uma vez só. Iniciar outro login apaga o desafio anterior da
conta e, de quebra, varre os vencidos.

Os dois estados têm status diferentes de propósito: `401` é código incorreto (tente de novo) e `410`
é tentativa encerrada — expirada, já usada ou sem tentativas —, caso em que o front volta para a
primeira etapa. O corpo do e-mail nunca vai para o log; o `NodemailerMailSender` registra só o
destinatário.

## Proteção de dados (LGPD)

A base é formada por dados pessoais, então quatro cuidados atravessam o código:

- **Operador identificado.** A conta guarda o CPF de quem a usa (`users.cpf`, nulo até a pessoa se
  identificar). `PUT /auth/me/cpf` grava esse vínculo uma única vez: reinformar o mesmo número é
  inofensivo, trocá-lo por outro é recusado com `422`, e um CPF já usado por outra conta responde
  `409`. As contas criadas pelo seed nascem sem CPF e o informam no primeiro acesso à área restrita.

- **Trilha de acesso.** `@AuditAccess('...')` marca as rotas que tocam dados pessoais e o
  `AuditAccessInterceptor` (global) registra, no logger `TrilhaDeAcesso`, quem fez o quê e sobre qual
  cadastro. O log guarda o ator, a ação e o id — nunca o conteúdo do cadastro, para não virar uma
  segunda cópia dele. A trilha vive no log da aplicação: em produção, direcione-o para um destino
  com retenção e acesso controlados.
- **Logs e respostas sem dado pessoal.** O `DomainExceptionFilter` corta a query string antes de
  registrar ou devolver a rota, porque o `search` da listagem costuma carregar nome ou CPF. Os
  conflitos de CPF respondem sem repetir o número: como `POST /residents` é público, confirmar o
  valor permitiria descobrir moradores por tentativa. `DATABASE_LOGGING` continua desligado por
  padrão — ligado, o TypeORM imprime as queries com CPF, RG e a assinatura.
- **Minimização na saída.** `GET /residents` responde com `ResidentListItemDto`, o mesmo contrato do
  detalhe sem a assinatura: a listagem serve para achar o cadastro, e a imagem só trafega em
  `GET /residents/:id`.

O PDF carrega em todas as páginas o aviso de confidencialidade e a identificação de quem o gerou
(`GET /residents/report` recebe o e-mail da sessão e o repassa ao gerador).

## Scripts

| Comando                     | Descrição                                     |
| --------------------------- | --------------------------------------------- |
| `npm run start:dev`         | Sobe a API em watch mode                      |
| `npm run build`             | Compila para `dist/`                          |
| `npm test`                  | Executa os testes de domínio (Jest)           |
| `npm run lint`              | ESLint + Prettier                             |
| `npm run migration:run`     | Aplica as migrations pendentes                |
| `npm run migration:revert`  | Desfaz a última migration                     |
| `npm run seed`              | Cria/atualiza as contas de `SEED_ACCOUNTS`    |
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
    ├── application/               Casos de uso, DTOs, portas e presenter
    ├── infrastructure/persistence/ Entidades TypeORM, mapper e o adapter do repositório
    ├── infrastructure/reports/    Adapter PDFKit que desenha o relatório de moradores
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
| `SEED_ACCOUNTS`     | `[]`                    | Lista JSON de contas do seed       |

`SEED_ACCOUNTS` é um JSON em uma linha, com `name`, `email` e `password` por conta:

```
SEED_ACCOUNTS=[{"name":"Fulana","email":"fulana@exemplo.com","password":"..."}]
```

O formato evita problemas com caracteres especiais na senha e cresce sem precisar de novas
variáveis. A API sobe sem ele; quem exige a lista preenchida é o `npm run seed`.

## Modelo de dados

`residents` é a tabela raiz; `resident_household_members`, `resident_employees`,
`resident_vehicles` e `resident_pets` referenciam o morador com `ON DELETE CASCADE`. O CPF tem
índice único e o banco reforça, por _check constraint_, que todo inquilino tenha
proprietário/administradora preenchido.

A assinatura manuscrita fica na coluna `residents.signature`, como data URL base64 de PNG ou JPEG.
O value object `SignatureImage` recusa qualquer imagem acima de **256 KB** — quem encolhe o desenho
até caber é o frontend, então a mensagem de erro não menciona tamanho: para o morador só existe a
opção de assinar de novo. O parser de JSON aceita até 1 MB por requisição para comportar o envio.

`residents.signed_at` é um `timestamptz` preenchido pelo relógio do servidor quando o cadastro é
criado. O campo não existe no `CreateResidentDto`, então nenhum cliente consegue escolher ou alterar
a data, e o `PUT` preserva o carimbo original do cadastro.

O schema é versionado por migrations — `synchronize` está desabilitado em todos os ambientes.

## Unidades do condomínio

O prédio tem 68 apartamentos: **101 a 117, 201 a 217, 301 a 317 e 401 a 417**. O value object `Unit`
guarda esse catálogo e é a única porta de entrada do campo, então nada fora da lista é aceito — nem
pelo DTO (`@IsIn`), nem pelo agregado.

Cada unidade preenche o formulário uma única vez. A regra é verificada nos casos de uso de criação e
edição (`409` com mensagem própria) e garantida pelo índice único `idx_residents_unit`, que protege
contra dois envios simultâneos.

`GET /api/residents/summary` resume a adesão para a área restrita: total de unidades, quantas já
preencheram, quantas faltam, **quais** faltam (`pendingUnitNumbers`, derivado do catálogo fixo menos
as unidades que responderam) e quantas pessoas moram nas unidades cadastradas (titulares mais os
moradores adicionais declarados).

## Relatório em PDF

`GET /api/residents/report` devolve um `application/pdf` com **uma página por morador**, na ordem da
listagem (unidade e depois nome) e com todos os dados do formulário, incluindo a assinatura. A rota
aceita os mesmos filtros da listagem (`search`, `unit`, `occupancyType`) e ignora a paginação: o
documento cobre todos os cadastros que casam com o filtro. Sem nenhum resultado, responde `404`.

O caso de uso `GenerateResidentsReportUseCase` só conhece a porta `ResidentsReportGenerator`; quem
desenha é o adapter `PdfKitResidentsReportGenerator`, com PDFKit e as fontes padrão do PDF (sem
arquivos de fonte no repositório). Como o PDF não tem interface para traduzir enums nem mascarar
CPF, placa e telefone, o adapter carrega suas próprias etiquetas (`report-labels.ts`) e formatações
(`report-format.ts`).

Uma ficha típica cabe em uma página; listas longas de moradores adicionais, funcionários, veículos
ou animais transbordam para páginas extras, sempre depois da primeira página daquele morador.
