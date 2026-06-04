namespace OniBusExpress.Api.Domain;

public class Viagem
{
    public string Id { get; set; } = string.Empty;
    public Guid RotaId { get; set; }
    public Rota? Rota { get; set; }
    public DateTime DataHoraPartidaUtc { get; set; }
    public decimal PrecoBase { get; set; }
    public int TotalAssentos { get; set; }

    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
}
