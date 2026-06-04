using OniBusExpress.Api.Services;

namespace OniBusExpress.Tests.Helpers;

public class TestClock : IClock
{
    public DateTime UtcNow { get; set; }
}
