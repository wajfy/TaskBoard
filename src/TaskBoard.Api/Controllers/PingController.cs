using Microsoft.AspNetCore.Mvc;

namespace TaskBoard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PingController : ControllerBase
{
    [HttpGet]
    public ActionResult<PingResponse> Get() =>
        new PingResponse("pong z .NET", DateTimeOffset.UtcNow);
    [HttpGet("{name}")]

    public ActionResult<PingResponse> GetByName(string name) =>
        new PingResponse($"Ahoj {name}", DateTimeOffset.UtcNow);
}

public record PingResponse(string Message, DateTimeOffset ServerTime);