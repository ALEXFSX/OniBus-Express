using Microsoft.EntityFrameworkCore;
using OniBusExpress.Api.Common;
using OniBusExpress.Api.Data;
using OniBusExpress.Api.Domain;
using OniBusExpress.Api.DTOs;

namespace OniBusExpress.Api.Services;

public class ReservationService : IReservationService
{
    private readonly AppDbContext _dbContext;
    private readonly ICpfValidator _cpfValidator;
    private readonly IReservationCodeGenerator _codeGenerator;
    private readonly IClock _clock;

    public ReservationService(
        AppDbContext dbContext,
        ICpfValidator cpfValidator,
        IReservationCodeGenerator codeGenerator,
        IClock clock)
    {
        _dbContext = dbContext;
        _cpfValidator = cpfValidator;
        _codeGenerator = codeGenerator;
        _clock = clock;
    }

    public async Task<ReservaResponse> CriarAsync(CriarReservaRequest request, CancellationToken cancellationToken = default)
    {
        if (!_cpfValidator.IsValid(request.Cpf))
        {
            throw new BusinessRuleException("CPF invalido.");
        }

        var viagemId = request.ViagemId.Trim().ToUpperInvariant();

        var viagem = await _dbContext.Viagens
            .Include(v => v.Rota)
            .FirstOrDefaultAsync(v => v.Id == viagemId, cancellationToken);

        if (viagem is null)
        {
            throw new BusinessRuleException("Viagem nao encontrada.");
        }

        if (viagem.DataHoraPartidaUtc <= _clock.UtcNow)
        {
            throw new BusinessRuleException("Nao e permitido reservar passagem para viagem ja realizada.");
        }

        if (request.NumeroAssento < 1 || request.NumeroAssento > viagem.TotalAssentos)
        {
            throw new BusinessRuleException("Numero de assento invalido para a viagem selecionada.");
        }

        var assentoOcupado = await _dbContext.Reservas
            .AnyAsync(r =>
                r.ViagemId == viagemId &&
                r.NumeroAssento == request.NumeroAssento &&
                r.Status == StatusReserva.Confirmada,
                cancellationToken);

        if (assentoOcupado)
        {
            throw new BusinessRuleException("Nao e possivel reservar um assento ja ocupado.");
        }

        var cpfNormalizado = NormalizarCpf(request.Cpf);
        var dataNascimentoUtc = NormalizarDataNascimento(request.DataNascimento);

        var passageiro = await _dbContext.Passageiros
            .FirstOrDefaultAsync(p => p.Cpf == cpfNormalizado, cancellationToken);

        if (passageiro is null)
        {
            passageiro = new Passageiro
            {
                Id = Guid.NewGuid(),
                Nome = request.Nome.Trim(),
                Cpf = cpfNormalizado,
                Email = request.Email.Trim(),
                DataNascimento = dataNascimentoUtc
            };

            _dbContext.Passageiros.Add(passageiro);
        }
        else
        {
            passageiro.Nome = request.Nome.Trim();
            passageiro.Email = request.Email.Trim();
            passageiro.DataNascimento = dataNascimentoUtc;
        }

        var codigoReserva = await GerarCodigoReservaUnicoAsync(cancellationToken);

        var reserva = new Reserva
        {
            Id = Guid.NewGuid(),
            ViagemId = viagem.Id,
            PassageiroId = passageiro.Id,
            NumeroAssento = request.NumeroAssento,
            Status = StatusReserva.Confirmada,
            CodigoReserva = codigoReserva,
            CriadaEmUtc = _clock.UtcNow
        };

        _dbContext.Reservas.Add(reserva);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            throw new BusinessRuleException("Nao foi possivel concluir a reserva. Tente novamente.");
        }

        reserva.Viagem = viagem;
        reserva.Passageiro = passageiro;

        return ToResponse(reserva);
    }

    public async Task<ReservaResponse?> BuscarPorCodigoAsync(string codigoReserva, CancellationToken cancellationToken = default)
    {
        var codigoNormalizado = codigoReserva.Trim().ToUpperInvariant();

        var reserva = await _dbContext.Reservas
            .Include(r => r.Passageiro)
            .Include(r => r.Viagem)
            .ThenInclude(v => v!.Rota)
            .FirstOrDefaultAsync(r => r.CodigoReserva == codigoNormalizado, cancellationToken);

        return reserva is null ? null : ToResponse(reserva);
    }

    public async Task CancelarAsync(string codigoReserva, CancellationToken cancellationToken = default)
    {
        var codigoNormalizado = codigoReserva.Trim().ToUpperInvariant();

        var reserva = await _dbContext.Reservas
            .Include(r => r.Viagem)
            .FirstOrDefaultAsync(r => r.CodigoReserva == codigoNormalizado, cancellationToken);

        if (reserva is null)
        {
            throw new BusinessRuleException("Reserva nao encontrada.");
        }

        if (reserva.Status == StatusReserva.Cancelada)
        {
            throw new BusinessRuleException("Reserva ja cancelada.");
        }

        var limiteCancelamentoUtc = reserva.Viagem!.DataHoraPartidaUtc.AddHours(-2);

        if (_clock.UtcNow > limiteCancelamentoUtc)
        {
            throw new BusinessRuleException("Cancelamento so permitido ate 2 horas antes da partida.");
        }

        reserva.Status = StatusReserva.Cancelada;
        reserva.CanceladaEmUtc = _clock.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<string> GerarCodigoReservaUnicoAsync(CancellationToken cancellationToken)
    {
        for (var i = 0; i < 50; i++)
        {
            var codigo = _codeGenerator.GenerateCode().ToUpperInvariant();

            var existe = await _dbContext.Reservas
                .AnyAsync(r => r.CodigoReserva == codigo, cancellationToken);

            if (!existe)
            {
                return codigo;
            }
        }

        throw new BusinessRuleException("Nao foi possivel gerar um codigo de reserva unico.");
    }

    private static string NormalizarCpf(string cpf)
    {
        return new string(cpf.Where(char.IsDigit).ToArray());
    }

    private static DateTime NormalizarDataNascimento(DateTime dataNascimento)
    {
        var data = dataNascimento.Date;

        return data.Kind switch
        {
            DateTimeKind.Utc => data,
            DateTimeKind.Local => data.ToUniversalTime(),
            _ => DateTime.SpecifyKind(data, DateTimeKind.Utc)
        };
    }

    private static ReservaResponse ToResponse(Reserva reserva)
    {
        return new ReservaResponse(
            reserva.CodigoReserva,
            reserva.Status.ToString(),
            reserva.NumeroAssento,
            reserva.CriadaEmUtc,
            reserva.CanceladaEmUtc,
            new PassageiroResponse(
                reserva.Passageiro!.Nome,
                reserva.Passageiro.Cpf,
                reserva.Passageiro.Email,
                reserva.Passageiro.DataNascimento),
            new ViagemReservaResponse(
                reserva.Viagem!.Id,
                reserva.Viagem.Rota!.Origem,
                reserva.Viagem.Rota.Destino,
                reserva.Viagem.DataHoraPartidaUtc,
                reserva.Viagem.PrecoBase));
    }
}
