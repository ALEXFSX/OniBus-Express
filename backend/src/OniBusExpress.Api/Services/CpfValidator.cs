using System.Text.RegularExpressions;

namespace OniBusExpress.Api.Services;

public class CpfValidator : ICpfValidator
{
    public bool IsValid(string? cpf)
    {
        if (string.IsNullOrWhiteSpace(cpf))
        {
            return false;
        }

        var cleaned = Regex.Replace(cpf, "[^0-9]", string.Empty);

        if (cleaned.Length != 11)
        {
            return false;
        }

        if (cleaned.Distinct().Count() == 1)
        {
            return false;
        }

        var digits = cleaned.Select(c => c - '0').ToArray();

        var firstVerifier = CalculateVerifierDigit(digits, 9, 10);
        if (digits[9] != firstVerifier)
        {
            return false;
        }

        var secondVerifier = CalculateVerifierDigit(digits, 10, 11);
        return digits[10] == secondVerifier;
    }

    private static int CalculateVerifierDigit(int[] digits, int count, int weightStart)
    {
        var sum = 0;

        for (var i = 0; i < count; i++)
        {
            sum += digits[i] * (weightStart - i);
        }

        var remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }
}
