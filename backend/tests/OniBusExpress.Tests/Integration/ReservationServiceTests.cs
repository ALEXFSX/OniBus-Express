using Microsoft.EntityFrameworkCore;
using OniBusExpress.Api.Common;
using OniBusExpress.Api.Domain;
using OniBusExpress.Api.DTOs;
using OniBusExpress.Api.Services;
using OniBusExpress.Tests.Helpers;
using Xunit;

namespace OniBusExpress.Tests.Integration;

public class ReservationServiceTests
{
    [Fact]
    public async Task NaoDevePermitirReservarAssentoJaOcupado()
    {
        var (db, connection) = TestDbFactory.CreateSqliteInMemoryDb();
        try
        {
            var now = new DateTime(2026, 6, 3, 12, 0, 0, DateTimeKind.Utc);
            var viagemId = await SeedViagemAsync(db, now.AddDays(1));

            var passenger = new Passageiro
            {
                Id = Guid.NewGuid(),
                Nome = "Fulano",
                Cpf = "52998224725",
                Email = "fulano@teste.com",
                DataNascimento = new DateTime(1990, 1, 1)
            };
            db.Passageiros.Add(passenger);

            db.Reservas.Add(new Reserva
            {
                Id = Guid.NewGuid(),
                ViagemId = viagemId,
                PassageiroId = passenger.Id,
                NumeroAssento = 10,
                Status = StatusReserva.Confirmada,
                CodigoReserva = "ABC-12345",
                CriadaEmUtc = now
            });
            await db.SaveChangesAsync();

            var service = new ReservationService(
                db,
                new CpfValidator(),
                new SequenceCodeGenerator(new[] { "DEF-54321" }),
                new TestClock { UtcNow = now });

            var request = new CriarReservaRequest
            {
                Nome = "Novo Cliente",
                Cpf = "11144477735",
                Email = "novo@teste.com",
                DataNascimento = new DateTime(1995, 5, 10),
                ViagemId = viagemId,
                NumeroAssento = 10
            };

            var ex = await Assert.ThrowsAsync<BusinessRuleException>(() => service.CriarAsync(request));
            Assert.Contains("assento ja ocupado", ex.Message, StringComparison.OrdinalIgnoreCase);
        }
        finally
        {
            await connection.DisposeAsync();
            await db.DisposeAsync();
        }
    }

    [Fact]
    public async Task NaoDevePermitirCancelamentoComMenosDeDuasHoras()
    {
        var (db, connection) = TestDbFactory.CreateSqliteInMemoryDb();
        try
        {
            var partida = new DateTime(2026, 6, 4, 13, 0, 0, DateTimeKind.Utc);
            var now = partida.AddHours(-1);
            var viagemId = await SeedViagemAsync(db, partida);

            var passenger = new Passageiro
            {
                Id = Guid.NewGuid(),
                Nome = "Fulano",
                Cpf = "52998224725",
                Email = "fulano@teste.com",
                DataNascimento = new DateTime(1990, 1, 1)
            };
            db.Passageiros.Add(passenger);

            db.Reservas.Add(new Reserva
            {
                Id = Guid.NewGuid(),
                ViagemId = viagemId,
                PassageiroId = passenger.Id,
                NumeroAssento = 4,
                Status = StatusReserva.Confirmada,
                CodigoReserva = "AAA-11111",
                CriadaEmUtc = now.AddHours(-2)
            });
            await db.SaveChangesAsync();

            var service = new ReservationService(
                db,
                new CpfValidator(),
                new SequenceCodeGenerator(new[] { "BBB-22222" }),
                new TestClock { UtcNow = now });

            var ex = await Assert.ThrowsAsync<BusinessRuleException>(() => service.CancelarAsync("AAA-11111"));
            Assert.Contains("2 horas", ex.Message, StringComparison.OrdinalIgnoreCase);
        }
        finally
        {
            await connection.DisposeAsync();
            await db.DisposeAsync();
        }
    }

    [Fact]
    public async Task DeveGerarCodigoUnicoQuandoPrimeiroCodigoJaExiste()
    {
        var (db, connection) = TestDbFactory.CreateSqliteInMemoryDb();
        try
        {
            var now = new DateTime(2026, 6, 3, 12, 0, 0, DateTimeKind.Utc);
            var viagemId = await SeedViagemAsync(db, now.AddDays(2));

            var existingPassenger = new Passageiro
            {
                Id = Guid.NewGuid(),
                Nome = "Cliente 1",
                Cpf = "52998224725",
                Email = "c1@teste.com",
                DataNascimento = new DateTime(1991, 1, 1)
            };
            db.Passageiros.Add(existingPassenger);

            db.Reservas.Add(new Reserva
            {
                Id = Guid.NewGuid(),
                ViagemId = viagemId,
                PassageiroId = existingPassenger.Id,
                NumeroAssento = 1,
                Status = StatusReserva.Confirmada,
                CodigoReserva = "AAA-00001",
                CriadaEmUtc = now
            });
            await db.SaveChangesAsync();

            var service = new ReservationService(
                db,
                new CpfValidator(),
                new SequenceCodeGenerator(new[] { "AAA-00001", "BBB-00002" }),
                new TestClock { UtcNow = now });

            var request = new CriarReservaRequest
            {
                Nome = "Cliente 2",
                Cpf = "11144477735",
                Email = "c2@teste.com",
                DataNascimento = new DateTime(1994, 4, 4),
                ViagemId = viagemId,
                NumeroAssento = 2
            };

            var reserva = await service.CriarAsync(request);

            Assert.Equal("BBB-00002", reserva.CodigoReserva);
            var totalComCodigo = await db.Reservas.CountAsync(r => r.CodigoReserva == "BBB-00002");
            Assert.Equal(1, totalComCodigo);
        }
        finally
        {
            await connection.DisposeAsync();
            await db.DisposeAsync();
        }
    }

    private static async Task<Guid> SeedViagemAsync(OniBusExpress.Api.Data.AppDbContext db, DateTime dataPartidaUtc)
    {
        var rota = new Rota
        {
            Id = Guid.NewGuid(),
            Origem = "Sao Paulo",
            Destino = "Curitiba",
            DuracaoEstimadaMinutos = 420
        };

        var viagem = new Viagem
        {
            Id = Guid.NewGuid(),
            RotaId = rota.Id,
            DataHoraPartidaUtc = dataPartidaUtc,
            PrecoBase = 119.90m,
            TotalAssentos = 40
        };

        db.Rotas.Add(rota);
        db.Viagens.Add(viagem);
        await db.SaveChangesAsync();

        return viagem.Id;
    }
}
