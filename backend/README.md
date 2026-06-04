# OniBus Express - Backend

API em .NET 8 para venda de passagens rodoviarias.

## Como executar com Docker

Na raiz do projeto:

```bash
docker-compose up --build
```

A API sobe em http://localhost:8080.

## Swagger

O Swagger fica disponivel em:

- http://localhost:8080/swagger
- http://localhost:8080/swagger/index.html

Ele permite testar os endpoints da API diretamente no navegador enquanto a aplicacao estiver rodando em ambiente de desenvolvimento.

## Endpoints

- GET /rotas
- GET /viagens?origem={origem}&destino={destino}&data={yyyy-MM-dd}
- GET /viagens/{id}
- POST /reservas
- GET /reservas/{codigo}
- DELETE /reservas/{codigo}

## Testes

Os testes automatizados do projeto usam xUnit e estao no projeto OniBusExpress.Tests.

Pre-requisito:

- .NET SDK 8 instalado (ou superior compativel)

Executar os testes a partir da pasta backend:

```bash
cd backend
dotnet test --nologo
```

Executar os testes a partir da raiz do repositorio (informando o caminho da solucao):

```bash
dotnet test backend/OniBusExpress.sln --nologo
```

Executar apenas o projeto de testes:

```bash
dotnet test backend/tests/OniBusExpress.Tests/OniBusExpress.Tests.csproj --nologo
```

## EF Migrations

Ja inclui migrations versionadas em [backend/src/OniBusExpress.Api/Migrations](backend/src/OniBusExpress.Api/Migrations).

Migrations disponiveis:

- [20260603120000_InitialCreate.cs](backend/src/OniBusExpress.Api/Migrations/20260603120000_InitialCreate.cs): cria o schema inicial do banco
- [20260603194000_AddMoreMockData.cs](backend/src/OniBusExpress.Api/Migrations/20260603194000_AddMoreMockData.cs): adiciona mais rotas e viagens de exemplo
- [20260603195500_AddPastTripMockData.cs](backend/src/OniBusExpress.Api/Migrations/20260603195500_AddPastTripMockData.cs): adiciona uma viagem com data anterior ao dia atual
- [20260603200000_AddTripInTwoHoursAndFourMinutes.cs](backend/src/OniBusExpress.Api/Migrations/20260603200000_AddTripInTwoHoursAndFourMinutes.cs): adiciona uma viagem com partida prevista em cerca de 2 horas e 4 minutos a frente

Comandos uteis (na pasta backend):

```bash
dotnet ef migrations add NomeDaMigration --project src/OniBusExpress.Api --startup-project src/OniBusExpress.Api
dotnet ef database update --project src/OniBusExpress.Api --startup-project src/OniBusExpress.Api
```

A aplicacao aplica migrations automaticamente ao iniciar (Database.MigrateAsync) e depois executa seed inicial.

## Observacoes de negocio implementadas

- Bloqueio de assento ja ocupado
- Bloqueio de reserva para viagem ja realizada
- Validacao de CPF com digitos verificadores
- Codigo de reserva legivel no formato AAA-12345
- Cancelamento permitido apenas ate 2 horas antes da partida
