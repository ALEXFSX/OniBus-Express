namespace OniBusExpress.Api.DTOs;

public record ReservaResponse(
    string CodigoReserva,
    string Status,
    int NumeroAssento,
    DateTime CriadaEmUtc,
    DateTime? CanceladaEmUtc,
    PassageiroResponse Passageiro,
    ViagemReservaResponse Viagem
);

public record PassageiroResponse(
    string Nome,
    string Cpf,
    string Email,
    DateTime DataNascimento
);

public record ViagemReservaResponse(
    string Id,
    string Origem,
    string Destino,
    DateTime DataHoraPartidaUtc,
    decimal PrecoBase
);
