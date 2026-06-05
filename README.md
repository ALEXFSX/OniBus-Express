# OniBus Express

Sistema para busca de rotas/viagens rodoviarias e reserva de passagens.

## Passo a passo rapido (Docker)

### 1. Pre-requisitos

- Docker Desktop instalado e em execucao.
- Porta 5173 livre (frontend), 8080 livre (API) e 5432 livre (PostgreSQL).

### 2. Subir todo o projeto

Na raiz do repositorio:

```bash
docker-compose up -d --build
```

Importante:
- Ao clonar o projeto, voce nao precisa rodar build manual do frontend nesse fluxo.
- O comando acima ja faz o build da imagem do frontend automaticamente.

### 3. Acessar aplicacao

- Frontend (Nginx): http://localhost:5173
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger

Observacao:
- O frontend em Docker usa `/api` e o Nginx encaminha internamente para o servico `api`.

### 4. Parar ambiente

```bash
docker-compose down
```

### 5. Resetar ambiente (apaga volume do banco)

```bash
docker-compose down -v
```

## Execucao sem Docker (backend + frontend)

### 1. Pre-requisitos

- .NET SDK 8+
- Node.js 20+
- npm 10+
- PostgreSQL 16+

### 2. Configurar banco local

```sql
CREATE DATABASE onibus_express;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE onibus_express TO postgres;
```

### 3. Ajustar connection string do backend

Arquivo: `backend/src/OniBusExpress.Api/appsettings.json`

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=onibus_express;Username=postgres;Password=postgres"
}
```

### 4. Subir backend

```bash
dotnet restore backend/OniBusExpress.sln
dotnet run --project backend/src/OniBusExpress.Api
```

Backend disponivel em:
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger

### 5. Subir frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Importante:
- Nesse fluxo de desenvolvimento local, nao precisa rodar `npm run build` para iniciar.
- O build do frontend (`npm run build`) e recomendado para validar o bundle de producao.

Frontend em desenvolvimento:
- http://localhost:5173

Observacao:
- Em desenvolvimento, o Vite usa proxy de `/api` para o backend.

## Testes

### Rodar todos os testes do backend

```bash
cd backend
dotnet test --nologo
```

### Rodar pela solucao

```bash
dotnet test backend/OniBusExpress.sln --nologo
```

### Rodar somente projeto de testes

```bash
dotnet test backend/tests/OniBusExpress.Tests/OniBusExpress.Tests.csproj --nologo
```

## Endpoints principais

- GET /rotas
- GET /viagens?origem={origem}&destino={destino}&data={yyyy-MM-dd}
- GET /viagens/{id}
- POST /reservas
- GET /reservas/{codigo}
- DELETE /reservas/{codigo}

## Troubleshooting

### Porta em uso

- Se 5173, 8080 ou 5432 estiverem ocupadas, pare o processo que usa a porta ou ajuste mapeamentos no `docker-compose.yml`.

### Erros por schema antigo de banco

- Faça reset completo do ambiente Docker:

```bash
docker-compose down -v
docker-compose up -d --build
```

### Frontend nao consegue chamar API

- Verifique se a API esta de pe em http://localhost:8080.
- Com Docker, teste o proxy pelo frontend: http://localhost:5173/api/rotas