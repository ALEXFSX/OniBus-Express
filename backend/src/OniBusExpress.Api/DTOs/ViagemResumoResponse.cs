namespace OniBusExpress.Api.DTOs;

public record ViagemResumoResponse(
    string Id,
    string Origem,
    string Destino,
    DateTime DataHoraPartidaUtc,
    decimal PrecoBase,
    int AssentosDisponiveis
);
