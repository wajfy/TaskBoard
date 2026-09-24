using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using TaskBoard.Api.Data;
using TaskBoard.Api.Services;

namespace TaskBoard.Api.Tests;

public class TokenServiceTests
{
    private static TokenService CreateService(int accessTokenMinutes = 15)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = TestJwt.Key,
                ["Jwt:Issuer"] = TestJwt.Issuer,
                ["Jwt:Audience"] = TestJwt.Audience,
                ["Jwt:AccessTokenMinutes"] = accessTokenMinutes.ToString(),
            })
            .Build();
        return new TokenService(configuration);
    }

    private static JwtSecurityToken Read(string token) => new JwtSecurityTokenHandler().ReadJwtToken(token);

    private static ApplicationUser CreateUser() => new() { Id = "user-42", Email = "jan@test.cz" };

    [Fact]
    public void Access_token_contains_user_id_and_email()
    {
        var token = Read(CreateService().GenerateAccessToken(CreateUser()));

        Assert.Equal("user-42", token.Claims.Single(c => c.Type == ClaimTypes.NameIdentifier).Value);
        Assert.Equal("jan@test.cz", token.Claims.Single(c => c.Type == ClaimTypes.Email).Value);
    }

    [Fact]
    public void Access_token_has_configured_issuer_and_audience()
    {
        var token = Read(CreateService().GenerateAccessToken(CreateUser()));

        Assert.Equal(TestJwt.Issuer, token.Issuer);
        Assert.Contains(TestJwt.Audience, token.Audiences);
    }

    [Theory]
    [InlineData(5)]
    [InlineData(15)]
    [InlineData(60)]
    public void Access_token_expires_after_configured_number_of_minutes(int minutes)
    {
        var token = Read(CreateService(minutes).GenerateAccessToken(CreateUser()));

        var expectedExpiry = DateTime.UtcNow.AddMinutes(minutes);
        Assert.InRange(token.ValidTo, expectedExpiry.AddSeconds(-10), expectedExpiry.AddSeconds(10));
    }

    [Fact]
    public void Refresh_tokens_are_unique()
    {
        var service = CreateService();

        var tokens = Enumerable.Range(0, 50).Select(_ => service.GenerateRefreshToken()).ToList();

        Assert.Equal(tokens.Count, tokens.Distinct().Count());
    }

    [Fact]
    public void Refresh_token_has_64_random_bytes()
    {
        var token = CreateService().GenerateRefreshToken();

        Assert.Equal(64, Convert.FromBase64String(token).Length);
    }
}
