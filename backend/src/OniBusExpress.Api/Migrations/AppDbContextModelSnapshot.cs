using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using OniBusExpress.Api.Data;

#nullable disable

namespace OniBusExpress.Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.8")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("OniBusExpress.Api.Domain.Passageiro", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Cpf")
                        .IsRequired()
                        .HasMaxLength(14)
                        .HasColumnType("character varying(14)");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)");

                    b.Property<string>("Nome")
                        .IsRequired()
                        .HasMaxLength(120)
                        .HasColumnType("character varying(120)");

                    b.HasKey("Id");

                    b.HasIndex("Cpf")
                        .IsUnique();

                    b.ToTable("passageiros", (string)null);
                });

            modelBuilder.Entity("OniBusExpress.Api.Domain.Reserva", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime?>("CanceladaEmUtc")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("CodigoReserva")
                        .IsRequired()
                        .HasMaxLength(16)
                        .HasColumnType("character varying(16)");

                    b.Property<DateTime>("CriadaEmUtc")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("NumeroAssento")
                        .HasColumnType("integer");

                    b.Property<Guid>("PassageiroId")
                        .HasColumnType("uuid");

                    b.Property<int>("Status")
                        .HasColumnType("integer");

                    b.Property<string>("ViagemId")
                        .IsRequired()
                        .HasMaxLength(12)
                        .HasColumnType("character varying(12)");

                    b.HasKey("Id");

                    b.HasIndex("CodigoReserva")
                        .IsUnique();

                    b.HasIndex("PassageiroId");

                    b.HasIndex("ViagemId");

                    b.ToTable("reservas", (string)null);
                });

            modelBuilder.Entity("OniBusExpress.Api.Domain.Rota", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Destino")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<int>("DuracaoEstimadaMinutos")
                        .HasColumnType("integer");

                    b.Property<string>("Origem")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.HasKey("Id");

                    b.ToTable("rotas", (string)null);
                });

            modelBuilder.Entity("OniBusExpress.Api.Domain.Viagem", b =>
                {
                    b.Property<string>("Id")
                        .IsRequired()
                        .HasMaxLength(12)
                        .HasColumnType("character varying(12)");

                    b.Property<DateTime>("DataHoraPartidaUtc")
                        .HasColumnType("timestamp with time zone");

                    b.Property<decimal>("PrecoBase")
                        .HasColumnType("numeric(10,2)");

                    b.Property<Guid>("RotaId")
                        .HasColumnType("uuid");

                    b.Property<int>("TotalAssentos")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("RotaId");

                    b.ToTable("viagens", (string)null);
                });

            modelBuilder.Entity("OniBusExpress.Api.Domain.Reserva", b =>
                {
                    b.HasOne("OniBusExpress.Api.Domain.Passageiro", "Passageiro")
                        .WithMany("Reservas")
                        .HasForeignKey("PassageiroId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("OniBusExpress.Api.Domain.Viagem", "Viagem")
                        .WithMany("Reservas")
                        .HasForeignKey("ViagemId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Passageiro");

                    b.Navigation("Viagem");
                });

            modelBuilder.Entity("OniBusExpress.Api.Domain.Viagem", b =>
                {
                    b.HasOne("OniBusExpress.Api.Domain.Rota", "Rota")
                        .WithMany("Viagens")
                        .HasForeignKey("RotaId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Rota");
                });

            modelBuilder.Entity("OniBusExpress.Api.Domain.Passageiro", b =>
                {
                    b.Navigation("Reservas");
                });

            modelBuilder.Entity("OniBusExpress.Api.Domain.Rota", b =>
                {
                    b.Navigation("Viagens");
                });

            modelBuilder.Entity("OniBusExpress.Api.Domain.Viagem", b =>
                {
                    b.Navigation("Reservas");
                });
#pragma warning restore 612, 618
        }
    }
}
