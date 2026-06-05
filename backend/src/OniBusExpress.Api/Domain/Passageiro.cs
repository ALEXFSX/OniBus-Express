namespace OniBusExpress.Api.Domain;

public class Passageiro
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
}
