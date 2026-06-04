# OniBus Express

Projeto de API para busca de rotas/viagens rodoviarias e reserva de passagens.

## 1) Como rodar o projeto localmente

### Com Docker

Na raiz do repositorio:

```bash
docker-compose up --build
```

Servicos:

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger

Para derrubar tudo:

```bash
docker-compose down -v
```

### Sem Docker

Pre-requisitos:

- .NET SDK 8+
- PostgreSQL 16+ em execucao local

1. Crie o banco e usuario (se necessario):

```sql
CREATE DATABASE onibus_express;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE onibus_express TO postgres;
```

2. Garanta a connection string em backend/src/OniBusExpress.Api/appsettings.json:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=onibus_express;Username=postgres;Password=postgres"
}
```

3. Suba a API pela raiz:

```bash
dotnet restore backend/OniBusExpress.sln
dotnet run --project backend/src/OniBusExpress.Api
```

4. Acesse:

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger

## 2) Tecnologias e bibliotecas usadas (e por que)

- .NET 8 (ASP.NET Core Web API): base robusta para API REST, DI nativo e alta produtividade.
- Entity Framework Core 8: mapeamento ORM e migrations para evolucao do schema.
- Npgsql.EntityFrameworkCore.PostgreSQL: provider EF Core para PostgreSQL.
- Swashbuckle.AspNetCore: geracao de documentacao Swagger/OpenAPI.
- xUnit: framework de testes automatizados (unitarios e integracao).
- Microsoft.NET.Test.Sdk e coverlet.collector: execucao de testes e coleta de cobertura.
- Docker e Docker Compose: ambiente reproduzivel com API + banco.

## 3) Decisoes de arquitetura relevantes

- Separacao por responsabilidades no backend:
  - Controllers para camada HTTP.
  - Services para regras de negocio.
  - Data/AppDbContext para persistencia.
  - Domain para entidades.
  - DTOs para contratos de entrada/saida.
- Regras de negocio centralizadas em ReservationService, mantendo controllers enxutos.
- Excecoes de negocio via BusinessRuleException, convertidas em respostas HTTP adequadas.
- Dependencias abstraidas por interfaces (IClock, ICpfValidator, IReservationCodeGenerator) para facilitar testes.
- Migrations versionadas em codigo e inicializacao automatica de banco/seed no startup para simplificar ambiente de desenvolvimento.

## 4) O que foi implementado

- Endpoints de rotas, viagens e reservas.
- Busca de viagens com filtros por origem, destino e data.
- Consulta de detalhes da viagem com assentos ocupados e livres.
- Criacao, consulta e cancelamento de reservas.
- Validacoes de negocio:
  - Bloqueio de assento ja ocupado.
  - Bloqueio de reserva para viagem ja realizada.
  - Validacao de CPF.
  - Codigo de reserva no formato AAA-12345.
  - Cancelamento permitido apenas ate 2 horas antes da partida.
- Persistencia com PostgreSQL e EF Core.
- Migrations e seed de dados.
- Testes automatizados (unitarios e integracao).


## 5) Como rodar os testes

Pela pasta backend:

```bash
cd backend
dotnet test --nologo
```

Pela raiz (solucao):

```bash
dotnet test backend/OniBusExpress.sln --nologo
```

Somente projeto de testes:

```bash
dotnet test backend/tests/OniBusExpress.Tests/OniBusExpress.Tests.csproj --nologo
```

## 6) Endpoints e documentacao

Endpoints principais:

- GET /rotas
- GET /viagens?origem={origem}&destino={destino}&data={yyyy-MM-dd}
- GET /viagens/{id}
- POST /reservas
- GET /reservas/{codigo}
- DELETE /reservas/{codigo}