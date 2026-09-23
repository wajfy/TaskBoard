using TaskBoard.Api.Data;

namespace TaskBoard.Api.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<AuthResponseDto?> RefreshAsync(string refreshToken);
    Task RevokeRefreshTokenAsync(string refreshToken);
}