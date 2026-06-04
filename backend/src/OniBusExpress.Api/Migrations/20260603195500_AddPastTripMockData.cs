using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OniBusExpress.Api.Migrations
{
    [DbContext(typeof(Data.AppDbContext))]
    [Migration("20260603195500_AddPastTripMockData")]
    public partial class AddPastTripMockData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
INSERT INTO rotas (""Id"", ""Origem"", ""Destino"", ""DuracaoEstimadaMinutos"") VALUES
('10000000-0000-0000-0000-000000000009', 'Belem', 'Sao Luis', 660)
ON CONFLICT (""Id"") DO NOTHING;
");

            migrationBuilder.Sql(@"
WITH viagem_seed(rota_id, prefixo_id, data_hora_partida_utc, preco_base, total_assentos) AS (
    VALUES ('10000000-0000-0000-0000-000000000009', 'BESL', NOW() - INTERVAL '2 days', 189.90, 42)
)
INSERT INTO viagens (""Id"", ""RotaId"", ""DataHoraPartidaUtc"", ""PrecoBase"", ""TotalAssentos"")
SELECT CONCAT(prefixo_id, TO_CHAR(data_hora_partida_utc, 'DDMMHH24MI')), rota_id::uuid, data_hora_partida_utc, preco_base, total_assentos
FROM viagem_seed
ON CONFLICT (""Id"") DO NOTHING;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DELETE FROM viagens
WHERE ""RotaId"" = '10000000-0000-0000-0000-000000000009'
  AND ""Id"" = CONCAT('BESL', TO_CHAR(""DataHoraPartidaUtc"", 'DDMMHH24MI'));
");

            migrationBuilder.Sql(@"
DELETE FROM rotas WHERE ""Id"" = '10000000-0000-0000-0000-000000000009';
");
        }
    }
}
