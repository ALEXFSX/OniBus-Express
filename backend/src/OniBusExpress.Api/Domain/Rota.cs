namespace OniBusExpress.Api.Domain;

public class Rota
{
    public Guid Id { get; set; }
    public string Origem { get; set; } = string.Empty;
    public string Destino { get; set; } = string.Empty;
    public int DuracaoEstimadaMinutos { get; set; }

    public ICollection<Viagem> Viagens { get; set; } = new List<Viagem>();
}
