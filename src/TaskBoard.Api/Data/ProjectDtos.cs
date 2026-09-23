using System.ComponentModel.DataAnnotations;

namespace TaskBoard.Api.Data;

public record ProjectDto(int Id, string Name, string? Description, DateTimeOffset CreatedAt, bool IsArchived);

public record CreateProjectDto([Required, MaxLength(200)] string Name, string? Description);

public record UpdateProjectDto([Required, MaxLength(200)] string Name, string? Description);
