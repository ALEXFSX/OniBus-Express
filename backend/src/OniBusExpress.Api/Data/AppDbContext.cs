using Microsoft.EntityFrameworkCore;
using OniBusExpress.Api.Domain;

namespace OniBusExpress.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Rota> Rotas => Set<Rota>();
    public DbSet<Viagem> Viagens => Set<Viagem>();
    public DbSet<Passageiro> Passageiros => Set<Passageiro>();
    public DbSet<Reserva> Reservas => Set<Reserva>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Rota>(entity =>
        {
            entity.ToTable("rotas");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Origem).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Destino).HasMaxLength(100).IsRequired();
            entity.Property(x => x.DuracaoEstimadaMinutos).IsRequired();
        });

        modelBuilder.Entity<Viagem>(entity =>
        {
            entity.ToTable("viagens");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasMaxLength(12).ValueGeneratedNever();
            entity.Property(x => x.DataHoraPartidaUtc).IsRequired();
            entity.Property(x => x.PrecoBase).HasColumnType("numeric(10,2)").IsRequired();
            entity.Property(x => x.TotalAssentos).IsRequired();

            entity.HasOne(x => x.Rota)
                .WithMany(x => x.Viagens)
                .HasForeignKey(x => x.RotaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Passageiro>(entity =>
        {
            entity.ToTable("passageiros");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Nome).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Cpf).HasMaxLength(14).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(200).IsRequired();
            entity.Property(x => x.DataNascimento).IsRequired();

            entity.HasIndex(x => x.Cpf).IsUnique();
        });

        modelBuilder.Entity<Reserva>(entity =>
        {
            entity.ToTable("reservas");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ViagemId).HasMaxLength(12).IsRequired();
            entity.Property(x => x.NumeroAssento).IsRequired();
            entity.Property(x => x.Status).IsRequired();
            entity.Property(x => x.CodigoReserva).HasMaxLength(16).IsRequired();
            entity.Property(x => x.CriadaEmUtc).IsRequired();

            entity.HasIndex(x => x.CodigoReserva).IsUnique();

            entity.HasOne(x => x.Viagem)
                .WithMany(x => x.Reservas)
                .HasForeignKey(x => x.ViagemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Passageiro)
                .WithMany(x => x.Reservas)
                .HasForeignKey(x => x.PassageiroId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
