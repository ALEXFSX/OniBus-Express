namespace OniBusExpress.Api.Domain;

public class Reserva
{
    public Guid Id { get; set; }
    public Guid ViagemId { get; set; }
    public Viagem? Viagem { get; set; }
    public Guid PassageiroId { get; set; }
    public Passageiro? Passageiro { get; set; }
    public int NumeroAssento { get; set; }
    public StatusReserva Status { get; set; }
    public string CodigoReserva { get; set; } = string.Empty;
    public DateTime CriadaEmUtc { get; set; }
    public DateTime? CanceladaEmUtc { get; set; }
}
