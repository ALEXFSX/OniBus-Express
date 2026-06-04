namespace OniBusExpress.Api.Services;

public interface ICpfValidator
{
    bool IsValid(string? cpf);
}
