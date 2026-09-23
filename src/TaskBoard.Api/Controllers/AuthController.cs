using Microsoft.AspNetCore.Mvc;
using TaskBoard.Api.Data;
using TaskBoard.Api.Services;

namespace TaskBoard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        var response = await authService.RegisterAsync(dto);
        if (response is null)
            return BadRequest("Registrace selhala – e-mail možná už existuje nebo heslo nesplňuje požadavky.");
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var response = await authService.LoginAsync(dto);
        if (response is null)
            return Unauthorized("Nesprávný e-mail nebo heslo.");
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh(RefreshRequestDto dto)
    {
        var response = await authService.RefreshAsync(dto.RefreshToken);
        if (response is null)
            return Unauthorized("Nesprávný refresh token.");
        return Ok(response);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshRequestDto dto)
    {
        await authService.RevokeRefreshTokenAsync(dto.RefreshToken);
        return NoContent();
    }
}