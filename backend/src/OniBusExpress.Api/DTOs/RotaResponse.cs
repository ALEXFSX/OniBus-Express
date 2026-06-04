namespace OniBusExpress.Api.DTOs;

public record RotaResponse(
    Guid Id,
    string Origem,
    string Destino,
    int DuracaoEstimadaMinutos
);
