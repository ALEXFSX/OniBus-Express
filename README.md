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
- Se estiver usando Docker, o Node não precisa estar instalado localmente, pois o build do frontend é feito dentro do container.

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
- Node.js 20+ (necessário para rodar o frontend localmente)
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
- Nesse fluxo de desenvolvimento local, é necessário ter Node.js e npm instalados para rodar o frontend.
- Nao precisa rodar `npm run build` para iniciar.
- O build do frontend (`npm run build`) é recomendado para validar o bundle de produção.

Frontend em desenvolvimento:
- http://localhost:5173

Observacao:
- Em desenvolvimento, o Vite usa proxy de `/api` para o backend.

## Testes

### Backend

#### Rodar todos os testes do backend

```bash
cd backend
dotnet test --nologo
```

#### Rodar pela solucao

```bash
dotnet test backend/OniBusExpress.sln --nologo
```

#### Rodar somente projeto de testes

```bash
dotnet test backend/tests/OniBusExpress.Tests/OniBusExpress.Tests.csproj --nologo
```

### Frontend

Os testes do frontend usam [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

#### Pre-requisito

Node.js 20+ e npm 10+ instalados.

#### Instalar dependencias (apenas na primeira vez)

```bash
cd frontend
npm install
```

#### Rodar os testes uma vez

```bash
cd frontend
npm test
```

#### Rodar em modo watch (re-executa ao salvar)

```bash
cd frontend
npm run test:watch
```

#### Cobertura dos testes

| Arquivo de teste | Componente testado | O que cobre |
|---|---|---|
| `SearchForm.test.tsx` | `SearchForm` | Renderização dos campos, preenchimento e submissão, validação de campos vazios, erro de origem igual ao destino |
| `SeatSelectionCard.test.tsx` | `SeatSelectionCard` | Exibição das informações da viagem, seleção de assento livre, bloqueio de assento ocupado, estado visual do assento selecionado, legenda |
| `PassengerDataCard.test.tsx` | `PassengerDataCard` | Renderização dos campos, exibição de erros de validação (nome, CPF, e-mail), callback onChange, callback onSubmit, atributo aria-invalid |

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

### Conflito de nome de container (ex: /onibus-db already in use)

Esse erro acontece quando ja existe um container antigo com o mesmo nome.

Use a limpeza completa e suba novamente:

```bash
docker-compose down -v --remove-orphans
docker rm -f onibus-db onibus-api onibus-frontend 2>/dev/null || true
docker-compose up -d --build
```

Se quiser apenas reiniciar sem limpar volumes:

```bash
docker-compose down
docker-compose up -d --build
```