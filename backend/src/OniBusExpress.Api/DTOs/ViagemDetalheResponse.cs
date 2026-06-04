namespace OniBusExpress.Api.DTOs;

public record ViagemDetalheResponse(
    string Id,
    string Origem,
    string Destino,
    DateTime DataHoraPartidaUtc,
    decimal PrecoBase,
    int TotalAssentos,
    IReadOnlyCollection<int> AssentosOcupados,
    IReadOnlyCollection<int> AssentosLivres
);
