# Projeto Lista de Tarefas

Aplicação de gestão de tarefas com:
- Frontend em Angular + PrimeNG
- Backend em Node.js + Express + SQL Server

## Estrutura

- `ToDo/`: frontend Angular
- `ToDo-parent/`: API backend
- `Querys/`: scripts SQL de apoio

## Pré-requisitos

- Node.js 20+
- npm
- SQL Server ativo e acessível

## Backend (ToDo-parent)

### 1. Configurar variáveis de ambiente

Crie o arquivo `.env` em `ToDo-parent/` com:

```env
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_SERVER=localhost
DB_DATABASE=nome_do_banco
DB_PORT=1433
FRONTEND_URL=http://localhost:4200
JWT_SECRET=sua_chave_jwt
```

### 2. Instalar dependências e iniciar

```bash
cd ToDo-parent
npm install
node --watch server.js
```

API padrão: `http://localhost:3000`

Swagger: `http://localhost:3000/api/docs`

### Rotas principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `DELETE /api/auth/profile`
- `GET /api/task?page=0&size=10&status=Pendente&search=texto`
- `POST /api/task`
- `PUT /api/task/:id`
- `DELETE /api/task/:id`

As rotas de tarefa exigem autenticação (token JWT).

### Formato de resposta da listagem (paginada)

```json
{
	"content": [],
	"totalElements": 0,
	"page": 0,
	"size": 10
}
```

## Frontend (ToDo)

### 1. Instalar dependências e iniciar

```bash
cd ToDo
npm install
npm start
```

Frontend padrão: `http://localhost:4200`

O frontend consome a API via proxy (`ToDo/src/proxy.conf.json`) com `apiUrl: '/api/'` em `ToDo/src/environments/environment.ts`.

## Fluxo rápido de execução

1. Suba o backend (`ToDo-parent`).
2. Suba o frontend (`ToDo`).
3. Acesse `http://localhost:4200`.

## Credenciais de demonstração

- Email: `demo_1779116244498@example.com`
- Senha: `Senha123!`
