using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OniBusExpress.Api.Data;
using OniBusExpress.Api.Domain;
using OniBusExpress.Api.DTOs;

namespace OniBusExpress.Api.Controllers;

[ApiController]
[Route("viagens")]
public class ViagensController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ViagensController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<ViagemResumoResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Buscar(
        [FromQuery] string? origem,
        [FromQuery] string? destino,
        [FromQuery] DateTime? data,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Viagens
            .AsNoTracking()
            .Include(v => v.Rota)
            .Include(v => v.Reservas)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(origem))
        {
            var origemTrim = origem.Trim().ToLower();
            query = query.Where(v => v.Rota!.Origem.ToLower().Contains(origemTrim));
        }

        if (!string.IsNullOrWhiteSpace(destino))
        {
            var destinoTrim = destino.Trim().ToLower();
            query = query.Where(v => v.Rota!.Destino.ToLower().Contains(destinoTrim));
        }

        if (data.HasValue)
        {
            var dataConsultaInicioUtc = DateTime.SpecifyKind(data.Value.Date, DateTimeKind.Utc);
            query = query.Where(v => v.DataHoraPartidaUtc >= dataConsultaInicioUtc);
        }

        var viagens = await query
            .OrderBy(v => v.DataHoraPartidaUtc)
            .Select(v => new ViagemResumoResponse(
                v.Id,
                v.Rota!.Origem,
                v.Rota.Destino,
                v.DataHoraPartidaUtc,
                v.PrecoBase,
                v.TotalAssentos - v.Reservas.Count(r => r.Status == StatusReserva.Confirmada)))
            .ToListAsync(cancellationToken);

        return Ok(viagens);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ViagemDetalheResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(string id, CancellationToken cancellationToken)
    {
        var viagemId = id.Trim().ToUpperInvariant();

        var viagem = await _dbContext.Viagens
            .AsNoTracking()
            .Include(v => v.Rota)
            .Include(v => v.Reservas)
            .FirstOrDefaultAsync(v => v.Id == viagemId, cancellationToken);

        if (viagem is null)
        {
            return NotFound();
        }

        var assentosOcupados = viagem.Reservas
            .Where(r => r.Status == StatusReserva.Confirmada)
            .Select(r => r.NumeroAssento)
            .OrderBy(x => x)
            .ToArray();

        var assentosLivres = Enumerable.Range(1, viagem.TotalAssentos)
            .Except(assentosOcupados)
            .ToArray();

        var response = new ViagemDetalheResponse(
            viagem.Id,
            viagem.Rota!.Origem,
            viagem.Rota.Destino,
            viagem.DataHoraPartidaUtc,
            viagem.PrecoBase,
            viagem.TotalAssentos,
            assentosOcupados,
            assentosLivres);

        return Ok(response);
    }
}
