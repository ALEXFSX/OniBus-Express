namespace OniBusExpress.Api.DTOs;

public record ViagemResumoResponse(
    Guid Id,
    string Origem,
    string Destino,
    DateTime DataHoraPartidaUtc,
    decimal PrecoBase,
    int AssentosDisponiveis
);
