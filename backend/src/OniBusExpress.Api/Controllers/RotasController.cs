using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OniBusExpress.Api.Data;
using OniBusExpress.Api.DTOs;

namespace OniBusExpress.Api.Controllers;

[ApiController]
[Route("rotas")]
public class RotasController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public RotasController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<RotaResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(CancellationToken cancellationToken)
    {
        var rotas = await _dbContext.Rotas
            .AsNoTracking()
            .OrderBy(r => r.Origem)
            .ThenBy(r => r.Destino)
            .Select(r => new RotaResponse(r.Id, r.Origem, r.Destino, r.DuracaoEstimadaMinutos))
            .ToListAsync(cancellationToken);

        return Ok(rotas);
    }
}
