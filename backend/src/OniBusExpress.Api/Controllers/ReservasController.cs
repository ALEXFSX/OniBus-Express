using Microsoft.AspNetCore.Mvc;
using OniBusExpress.Api.Common;
using OniBusExpress.Api.DTOs;
using OniBusExpress.Api.Services;

namespace OniBusExpress.Api.Controllers;

[ApiController]
[Route("reservas")]
public class ReservasController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservasController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ReservaResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Criar([FromBody] CriarReservaRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var reserva = await _reservationService.CriarAsync(request, cancellationToken);
            return CreatedAtAction(nameof(ObterPorCodigo), new { codigo = reserva.CodigoReserva }, reserva);
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    [HttpGet("{codigo}")]
    [ProducesResponseType(typeof(ReservaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorCodigo(string codigo, CancellationToken cancellationToken)
    {
        var reserva = await _reservationService.BuscarPorCodigoAsync(codigo, cancellationToken);
        if (reserva is null)
        {
            return NotFound();
        }

        return Ok(reserva);
    }

    [HttpDelete("{codigo}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancelar(string codigo, CancellationToken cancellationToken)
    {
        try
        {
            await _reservationService.CancelarAsync(codigo, cancellationToken);
            return NoContent();
        }
        catch (BusinessRuleException ex) when (ex.Message.Contains("nao encontrada", StringComparison.OrdinalIgnoreCase))
        {
            return NotFound(new { erro = ex.Message });
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }
}
