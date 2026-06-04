using System.Globalization;
using System.Text;

namespace OniBusExpress.Api.Common;

public static class ViagemIdGenerator
{
    private static readonly HashSet<string> StopWords = new(StringComparer.Ordinal)
    {
        "DA",
        "DAS",
        "DE",
        "DO",
        "DOS",
        "E"
    };

    public static string Generate(string origem, string destino, DateTime dataHoraPartidaUtc)
    {
        return string.Concat(
            ToCityCode(origem),
            ToCityCode(destino),
            dataHoraPartidaUtc.ToString("ddMMHHmm", CultureInfo.InvariantCulture));
    }

    private static string ToCityCode(string cidade)
    {
        var normalized = RemoveDiacritics(cidade).ToUpperInvariant();
        var significantParts = normalized
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(part => !StopWords.Contains(part))
            .ToArray();

        if (significantParts.Length >= 2)
        {
            return string.Concat(significantParts[0][0], significantParts[^1][0]);
        }

        var singlePart = significantParts.FirstOrDefault() ?? "XX";
        return singlePart.Length >= 2 ? singlePart[..2] : singlePart.PadRight(2, 'X');
    }

    private static string RemoveDiacritics(string value)
    {
        var normalized = value.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(normalized.Length);

        foreach (var character in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(character);
            }
        }

        return builder.ToString().Normalize(NormalizationForm.FormC);
    }
}