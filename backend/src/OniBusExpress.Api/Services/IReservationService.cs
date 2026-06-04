using OniBusExpress.Api.DTOs;

namespace OniBusExpress.Api.Services;

public interface IReservationService
{
    Task<ReservaResponse> CriarAsync(CriarReservaRequest request, CancellationToken cancellationToken = default);
    Task<ReservaResponse?> BuscarPorCodigoAsync(string codigoReserva, CancellationToken cancellationToken = default);
    Task CancelarAsync(string codigoReserva, CancellationToken cancellationToken = default);
}
