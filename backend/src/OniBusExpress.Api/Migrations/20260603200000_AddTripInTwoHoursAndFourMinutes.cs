using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OniBusExpress.Api.Migrations
{
    [DbContext(typeof(Data.AppDbContext))]
    [Migration("20260603200000_AddTripInTwoHoursAndFourMinutes")]
    public partial class AddTripInTwoHoursAndFourMinutes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
INSERT INTO rotas (""Id"", ""Origem"", ""Destino"", ""DuracaoEstimadaMinutos"") VALUES
('10000000-0000-0000-0000-000000000010', 'Manaus', 'Boa Vista', 420)
ON CONFLICT (""Id"") DO NOTHING;
");

            migrationBuilder.Sql(@"
INSERT INTO viagens (""Id"", ""RotaId"", ""DataHoraPartidaUtc"", ""PrecoBase"", ""TotalAssentos"") VALUES
('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000010', NOW() + INTERVAL '2 hours 4 minutes', 199.90, 40)
ON CONFLICT (""Id"") DO NOTHING;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DELETE FROM viagens WHERE ""Id"" = '20000000-0000-0000-0000-000000000018';
");

            migrationBuilder.Sql(@"
DELETE FROM rotas WHERE ""Id"" = '10000000-0000-0000-0000-000000000010';
");
        }
    }
}
