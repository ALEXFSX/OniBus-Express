using OniBusExpress.Api.Services;
using Xunit;

namespace OniBusExpress.Tests.Unit;

public class CpfValidatorTests
{
    private readonly CpfValidator _validator = new();

    [Theory]
    [InlineData("529.982.247-25")]
    [InlineData("52998224725")]
    [InlineData("11144477735")]
    public void DeveValidarCpfValido(string cpf)
    {
        var result = _validator.IsValid(cpf);
        Assert.True(result);
    }

    [Theory]
    [InlineData("123.456.789-00")]
    [InlineData("11111111111")]
    [InlineData("00000000000")]
    [InlineData("52998224724")]
    [InlineData("")]
    [InlineData("123")]
    public void DeveInvalidarCpfInvalido(string cpf)
    {
        var result = _validator.IsValid(cpf);
        Assert.False(result);
    }
}
