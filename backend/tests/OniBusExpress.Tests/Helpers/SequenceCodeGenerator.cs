using OniBusExpress.Api.Services;

namespace OniBusExpress.Tests.Helpers;

public class SequenceCodeGenerator : IReservationCodeGenerator
{
    private readonly Queue<string> _codes;

    public SequenceCodeGenerator(IEnumerable<string> codes)
    {
        _codes = new Queue<string>(codes);
    }

    public string GenerateCode()
    {
        if (_codes.Count == 0)
        {
            return "ZZZ-99999";
        }

        return _codes.Dequeue();
    }
}
