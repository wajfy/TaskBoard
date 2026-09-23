using TaskBoard.Api.Data;

namespace TaskBoard.Api.Services;

public interface ITokenService
{
    string GenerateAccessToken(ApplicationUser user);
    string GenerateRefreshToken();
}