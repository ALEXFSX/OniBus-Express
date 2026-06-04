using System.Security.Cryptography;

namespace OniBusExpress.Api.Services;

public class ReservationCodeGenerator : IReservationCodeGenerator
{
    private const string Letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";

    public string GenerateCode()
    {
        var prefix = new char[3];

        for (var i = 0; i < prefix.Length; i++)
        {
            prefix[i] = Letters[RandomNumberGenerator.GetInt32(0, Letters.Length)];
        }

        var number = RandomNumberGenerator.GetInt32(0, 100000);
        return $"{new string(prefix)}-{number:00000}";
    }
}
