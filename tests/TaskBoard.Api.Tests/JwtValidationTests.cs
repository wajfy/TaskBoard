using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace TaskBoard.Api.Tests;

[Collection("api")]
public class JwtValidationTests(ApiFactory factory)
{
    private const string OtherKey = "uplne-jiny-tajny-klic-taky-alespon-32-znaku!!";

    private static string CreateToken(
        string key = TestJwt.Key,
        string issuer = TestJwt.Issuer,
        string audience = TestJwt.Audience,
        TimeSpan? lifetime = null)
    {
        var now = DateTime.UtcNow;
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer,
            audience,
            [new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())],
            notBefore: now.AddMinutes(-30),
            expires: now.Add(lifetime ?? TimeSpan.FromMinutes(15)),
            signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<HttpStatusCode> CallApiWithAsync(string token)
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response = await client.GetAsync("/api/projects");
        return response.StatusCode;
    }

    [Fact]
    public async Task Correctly_signed_token_is_accepted()
    {
        Assert.Equal(HttpStatusCode.OK, await CallApiWithAsync(CreateToken()));
    }

    [Fact]
    public async Task Token_signed_with_another_key_is_rejected()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, await CallApiWithAsync(CreateToken(key: OtherKey)));
    }

    [Fact]
    public async Task Expired_token_is_rejected()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, await CallApiWithAsync(CreateToken(lifetime: TimeSpan.FromMinutes(-1))));
    }

    [Theory]
    [InlineData("Jiny.Vydavatel", TestJwt.Audience)]
    [InlineData(TestJwt.Issuer, "Jina.Aplikace")]
    public async Task Token_with_wrong_issuer_or_audience_is_rejected(string issuer, string audience)
    {
        Assert.Equal(HttpStatusCode.Unauthorized, await CallApiWithAsync(CreateToken(issuer: issuer, audience: audience)));
    }

    [Fact]
    public async Task Garbage_token_is_rejected()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, await CallApiWithAsync("toto.neni.token"));
    }
}
