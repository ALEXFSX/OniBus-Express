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
INSERT INTO viagens (""Id"", ""RotaId"", ""DataHoraPartidaUtc"", ""PrecoBase"", ""TotalAssentos"") VALUES
('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000009', NOW() - INTERVAL '2 days', 189.90, 42)
ON CONFLICT (""Id"") DO NOTHING;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DELETE FROM viagens WHERE ""Id"" = '20000000-0000-0000-0000-000000000017';
");

            migrationBuilder.Sql(@"
DELETE FROM rotas WHERE ""Id"" = '10000000-0000-0000-0000-000000000009';
");
        }
    }
}
