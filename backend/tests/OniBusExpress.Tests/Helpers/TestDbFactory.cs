using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using OniBusExpress.Api.Data;

namespace OniBusExpress.Tests.Helpers;

public static class TestDbFactory
{
    public static (AppDbContext DbContext, SqliteConnection Connection) CreateSqliteInMemoryDb()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();

        return (context, connection);
    }
}
