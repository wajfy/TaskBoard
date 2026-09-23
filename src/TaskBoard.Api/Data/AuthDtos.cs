using System.ComponentModel.DataAnnotations;

namespace TaskBoard.Api.Data;

public record RegisterDto(
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password
);

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record RefreshRequestDto([Required] string RefreshToken);

public record AuthResponseDto(string AccessToken, string RefreshToken, DateTimeOffset ExpiresAt);