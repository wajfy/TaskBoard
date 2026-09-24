using System.Net;
using System.Net.Http.Json;
using TaskBoard.Api.Data;

namespace TaskBoard.Api.Tests;

[Collection("api")]
public class AuthTests(ApiFactory factory)
{
    [Fact]
    public async Task Endpoint_without_token_returns_401()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/projects");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Register_returns_access_and_refresh_token()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register",
            new { email = $"{Guid.NewGuid()}@test.cz", password = "heslo1234" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var auth = await response.Content.ReadFromJsonAsync<AuthResponseDto>(Json.Options);
        Assert.False(string.IsNullOrWhiteSpace(auth!.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(auth.RefreshToken));
    }

    [Fact]
    public async Task Wrong_password_returns_401()
    {
        var client = factory.CreateClient();
        string email = $"{Guid.NewGuid()}@test.cz";

        await client.PostAsJsonAsync("/api/auth/register",
            new { email, password = "heslo1234" });

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { email, password = "hesloheslo" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Refresh_token_can_be_used_only_once()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register",
            new { email = $"{Guid.NewGuid()}@test.cz", password = "heslo1234" });
        ;
        var auth = await response.Content.ReadFromJsonAsync<AuthResponseDto>(Json.Options);

        var firstResponse = await client.PostAsJsonAsync("/api/auth/refresh",
            new { auth!.RefreshToken });

        var secondResponse = await client.PostAsJsonAsync("/api/auth/refresh",
            new { auth!.RefreshToken });

        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, secondResponse.StatusCode);
    }
}