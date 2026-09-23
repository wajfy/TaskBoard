using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaskBoard.Api.Data;

namespace TaskBoard.Api.Services;

public class AuthService(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService,
    AppDbContext db,
    IConfiguration configuration) : IAuthService
{
    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email };
        var result = await userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return null;

        return await IssueTokensAsync(user);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user is null)
            return null;

        var passwordValid = await userManager.CheckPasswordAsync(user, dto.Password);
        if (!passwordValid)
            return null;

        return await IssueTokensAsync(user);
    }

    public async Task<AuthResponseDto?> RefreshAsync(string refreshToken)
    {
        var existing = await db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (existing is null || !existing.IsActive)
            return null;

        existing.RevokedAt = DateTimeOffset.UtcNow;

        return await IssueTokensAsync(existing.User);
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        var existing = await db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
        if (existing is null) return;

        existing.RevokedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
    }

    private async Task<AuthResponseDto> IssueTokensAsync(ApplicationUser user)
    {
        var accessToken = tokenService.GenerateAccessToken(user);
        var refreshTokenValue = tokenService.GenerateRefreshToken();
        var refreshDays = configuration.GetValue<int>("Jwt:RefreshTokenDays");

        db.RefreshTokens.Add(new RefreshToken
        {
            Token = refreshTokenValue,
            UserId = user.Id,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(refreshDays),
        });
        await db.SaveChangesAsync();

        var accessMinutes = configuration.GetValue<int>("Jwt:AccessTokenMinutes");

        return new AuthResponseDto(accessToken, refreshTokenValue, DateTimeOffset.UtcNow.AddMinutes(accessMinutes));
    }
}