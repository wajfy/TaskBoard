using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TaskBoard.Api.Tests;

[Collection("api")]
public class ProtectedEndpointsTests(ApiFactory factory)
{
    [Theory]
    [InlineData("GET", "/api/projects")]
    [InlineData("POST", "/api/projects")]
    [InlineData("GET", "/api/projects/1")]
    [InlineData("PUT", "/api/projects/1")]
    [InlineData("DELETE", "/api/projects/1")]
    [InlineData("POST", "/api/projects/1/archive")]
    [InlineData("POST", "/api/projects/1/unarchive")]
    [InlineData("GET", "/api/projects/1/tasks")]
    [InlineData("POST", "/api/projects/1/tasks")]
    [InlineData("GET", "/api/projects/1/tasks/1")]
    [InlineData("PUT", "/api/projects/1/tasks/1")]
    [InlineData("DELETE", "/api/projects/1/tasks/1")]
    public async Task Endpoint_requires_a_token(string method, string url)
    {
        var client = factory.CreateClient();

        var response = await client.SendAsync(new HttpRequestMessage(new HttpMethod(method), url));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public void Every_controller_requires_authorization_unless_explicitly_public()
    {
        string[] publicControllers = ["AuthController", "PingController"];

        var unprotected = typeof(Program).Assembly.GetTypes()
            .Where(type => typeof(ControllerBase).IsAssignableFrom(type) && !type.IsAbstract)
            .Where(type => !publicControllers.Contains(type.Name))
            .Where(type => !type.IsDefined(typeof(AuthorizeAttribute), inherit: true))
            .Select(type => type.Name)
            .ToList();

        Assert.Empty(unprotected);
    }
}
