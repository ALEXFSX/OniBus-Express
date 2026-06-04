using System.ComponentModel.DataAnnotations;

namespace OniBusExpress.Api.DTOs;

public class CriarReservaRequest
{
    [Required]
    [StringLength(120)]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [StringLength(14)]
    public string Cpf { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public DateTime DataNascimento { get; set; }

    [Required]
    public Guid ViagemId { get; set; }

    [Range(1, 200)]
    public int NumeroAssento { get; set; }
}
