# OniBus Express - Backend

Este modulo contem a API em .NET 8.

As instrucoes principais do projeto (execucao com e sem Docker, tecnologias, arquitetura, escopo implementado, testes e melhorias) estao no [README da raiz](../README.md).

## Comandos rapidos

Rodar API:

```bash
dotnet run --project src/OniBusExpress.Api
```

Rodar testes:

```bash
dotnet test --nologo
```

Swagger (com API em execucao):

- http://localhost:8080/swagger

## Migrations

Arquivos de migrations:

- src/OniBusExpress.Api/Migrations

Comandos uteis:

```bash
dotnet ef migrations add NomeDaMigration --project src/OniBusExpress.Api --startup-project src/OniBusExpress.Api
dotnet ef database update --project src/OniBusExpress.Api --startup-project src/OniBusExpress.Api
```
