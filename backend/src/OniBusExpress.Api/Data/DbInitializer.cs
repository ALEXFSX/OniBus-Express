using Microsoft.EntityFrameworkCore;
using OniBusExpress.Api.Domain;

namespace OniBusExpress.Api.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext dbContext)
    {
        await dbContext.Database.MigrateAsync();

        if (await dbContext.Rotas.AnyAsync())
        {
            return;
        }

        var rota1 = new Rota
        {
            Id = Guid.NewGuid(),
            Origem = "Sao Paulo",
            Destino = "Rio de Janeiro",
            DuracaoEstimadaMinutos = 360
        };

        var rota2 = new Rota
        {
            Id = Guid.NewGuid(),
            Origem = "Campinas",
            Destino = "Belo Horizonte",
            DuracaoEstimadaMinutos = 480
        };

        dbContext.Rotas.AddRange(rota1, rota2);

        dbContext.Viagens.AddRange(
            new Viagem
            {
                Id = Guid.NewGuid(),
                RotaId = rota1.Id,
                DataHoraPartidaUtc = DateTime.UtcNow.Date.AddDays(2).AddHours(12),
                PrecoBase = 129.90m,
                TotalAssentos = 44
            },
            new Viagem
            {
                Id = Guid.NewGuid(),
                RotaId = rota1.Id,
                DataHoraPartidaUtc = DateTime.UtcNow.Date.AddDays(3).AddHours(8),
                PrecoBase = 99.90m,
                TotalAssentos = 44
            },
            new Viagem
            {
                Id = Guid.NewGuid(),
                RotaId = rota2.Id,
                DataHoraPartidaUtc = DateTime.UtcNow.Date.AddDays(4).AddHours(10),
                PrecoBase = 149.90m,
                TotalAssentos = 46
            });

        await dbContext.SaveChangesAsync();
    }
}
