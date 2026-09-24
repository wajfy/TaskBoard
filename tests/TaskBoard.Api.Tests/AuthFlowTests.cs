using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using TaskBoard.Api.Data;

namespace TaskBoard.Api.Tests;

[Collection("api")]
public class AuthFlowTests(ApiFactory factory)
{
    private static async Task<AuthResponseDto> RegisterAsync(HttpClient client, string email)
    {
        var response = await client.PostAsJsonAsync("/api/auth/register", new { email, password = "heslo1234" });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<AuthResponseDto>(Json.Options))!;
    }

    private static string NewEmail() => $"{Guid.NewGuid()}@test.cz";

    [Fact]
    public async Task Registering_the_same_email_twice_returns_400()
    {
        var client = factory.CreateClient();
        var email = NewEmail();
        await RegisterAsync(client, email);

        var response = await client.PostAsJsonAsync("/api/auth/register", new { email, password = "heslo1234" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("neni-email", "heslo1234")]
    [InlineData("", "heslo1234")]
    [InlineData("kratke@test.cz", "kratke")]
    [InlineData("prazdne@test.cz", "")]
    public async Task Registering_with_invalid_input_returns_400(string email, string password)
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new { email, password });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_with_valid_credentials_returns_working_tokens()
    {
        var client = factory.CreateClient();
        var email = NewEmail();
        await RegisterAsync(client, email);

        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "heslo1234" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var auth = await response.Content.ReadFromJsonAsync<AuthResponseDto>(Json.Options);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth!.AccessToken);
        var projects = await client.GetAsync("/api/projects");
        Assert.Equal(HttpStatusCode.OK, projects.StatusCode);
    }

    [Fact]
    public async Task Login_with_unknown_email_looks_the_same_as_wrong_password()
    {
        var client = factory.CreateClient();
        var email = NewEmail();
        await RegisterAsync(client, email);

        var unknownEmail = await client.PostAsJsonAsync("/api/auth/login", new { email = NewEmail(), password = "heslo1234" });
        var wrongPassword = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "spatne-heslo" });

        Assert.Equal(HttpStatusCode.Unauthorized, unknownEmail.StatusCode);
        Assert.Equal(wrongPassword.StatusCode, unknownEmail.StatusCode);
        Assert.Equal(await wrongPassword.Content.ReadAsStringAsync(), await unknownEmail.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Refresh_returns_new_tokens_and_the_new_access_token_works()
    {
        var client = factory.CreateClient();
        var auth = await RegisterAsync(client, NewEmail());

        var response = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = auth.RefreshToken });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var renewed = await response.Content.ReadFromJsonAsync<AuthResponseDto>(Json.Options);
        Assert.NotEqual(auth.RefreshToken, renewed!.RefreshToken);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", renewed.AccessToken);
        var projects = await client.GetAsync("/api/projects");
        Assert.Equal(HttpStatusCode.OK, projects.StatusCode);
    }

    [Fact]
    public async Task Refresh_with_unknown_token_returns_401()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = "neexistujici-token" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Refresh_with_empty_token_returns_400()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Logout_revokes_the_refresh_token()
    {
        var client = factory.CreateClient();
        var auth = await RegisterAsync(client, NewEmail());

        var logout = await client.PostAsJsonAsync("/api/auth/logout", new { refreshToken = auth.RefreshToken });
        var refresh = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = auth.RefreshToken });

        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, refresh.StatusCode);
    }

    [Fact]
    public async Task Logout_with_unknown_token_is_not_an_error()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/logout", new { refreshToken = "neexistujici-token" });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
